import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import AddMemoryCard from "../addMemoryCard/AddMemoryCard";
import { useInviteToken } from "../../hooks/useInviteToken";

const WRAPPER_TRANSITION_MS = 400; // Altar에서 사라지는 시간과 맞춰서 자연스럽게 이어지도록 함
const SCROLL_HOLD_MS = 1000; // 화면 전환 직후, 이 시간 동안은 맨 위 상태를 유지하고 스크롤을 막음

const PHOTO_COUNT = 24;
const MIN_CELL = 200; // 사진 한 칸의 최소 크기(px)

const TRANSFORM_MS = 2600; // 커지는 동작(scale)은 천천히, 더 자연스럽게
const FADE_MS = 1800; // 투명도는 가벼운 연산이라 커지는 속도에 맞춰 같이 늘려도 괜찮음
const HEAVY_EFFECT_MS = 500; // blur/border-radius는 무거운 연산이라, 사진이 많아도 안 밀리도록 짧게 끝냄
const STAGGER_MS = 300; // 같은 타이밍에 여러 장이 한꺼번에 화면에 들어와도, 조금씩 랜덤하게 시차를 둠
const CASCADE_STEP_MS = 70; // 처음 화면에 걸쳐있는 사진들이 전부 동시에 시작하면 버벅이므로,
// 배열 순서(대략 위→아래) 기준으로 조금씩 더 늦게 시작하도록 벌려줌

// 겹침 없이 크기를 다르게 주기 위해, 몇몇 칸만 2칸(가로 또는 세로)씩 차지하게 함
// (CSS Grid가 알아서 자리를 배치해주기 때문에 절대 겹치지 않음)
function randomSpan(): 1 | 2 {
  return Math.random() < 0.25 ? 2 : 1;
}

// 조문객이 "추념하기"로 남긴 글을 흉내낸 더미 데이터.
// TODO: 실제 등록 API/조회 API가 생기면 여기 대신 서버에서 받아온 목록을 써야 함.
const SAMPLE_NAMES = ["김민준", "이서연", "박도윤", "최지우", "정하은", "강시우", "조수아", "윤예준"];
const SAMPLE_MESSAGES = [
  "함께했던 시간 모두 소중했습니다. 편히 쉬세요.",
  "언제나 그리울 거예요. 그동안 고마웠습니다.",
  "함께 나눴던 이야기들이 아직도 생생합니다.",
  "웃음이 많았던 모습을 기억할게요.",
  "고맙습니다. 그리고 사랑합니다.",
  "따뜻했던 기억들 오래 간직하겠습니다.",
  "언제나 든든한 분이셨어요. 감사했습니다.",
  "함께 걸었던 그 길을 잊지 못할 것 같아요.",
];

// 사진마다 위치/크기/기울기/글을 무작위로 미리 계산해둠
// (렌더링마다 바뀌면 계속 움직여 보이므로, 한 번만 계산되도록 useMemo로 고정)
function generatePhotoLayout() {
  return Array.from({ length: PHOTO_COUNT }).map((_, i) => ({
    id: i,
    src: `https://picsum.photos/seed/altar${i}/400/400`,
    colSpan: randomSpan(),
    rowSpan: randomSpan(),
    rotate: Math.random() * 10 - 5, // -5 ~ 5도로 살짝 삐뚤게
    name: SAMPLE_NAMES[i % SAMPLE_NAMES.length],
    message: SAMPLE_MESSAGES[i % SAMPLE_MESSAGES.length],
  }));
}

export default function NextPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false); // 위로 스크롤해서 이전 화면으로 돌아가는 중인지
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false); // 추억 남기기 팝업이 열려있는지
  const [toastMessage, setToastMessage] = useState<string | null>(null); // 화면 가운데 뜨는 감사 토스트
  const [selectedPhoto, setSelectedPhoto] = useState<{
    src: string;
    name: string;
    message: string;
  } | null>(null); // 클릭해서 크게 본 사진(+글)
  const photos = useMemo(generatePhotoLayout, []);
  const navigate = useNavigate();
  const key = useInviteToken();
  const hasGoneBack = useRef(false); // 뒤로가기 중복 실행 방지

  useEffect(() => {
    // 마운트되자마자 true로 바꿔야 transition이 애니메이션으로 재생됨
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Altar에서 스크롤하던 힘이 그대로 이어져서 이 페이지가 중간부터 보이는 문제를 막기 위해,
  // 화면이 그려지기 전에(useLayoutEffect) 맨 위로 스크롤을 고정하고, 잠깐 동안 스크롤 자체를 막아둠
  //
  // 주의: body에 overflow:hidden을 걸면 스크롤바가 사라지면서 화면 폭이 넓어져
  // (스크롤바 두께만큼) 그리드 열 개수가 바뀌는 버그가 있었음(5열→4열).
  // 그래서 overflow는 건드리지 않고, 스크롤을 유발하는 이벤트만 잠깐 무시하는 방식으로 바꿈.
  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    const blockScroll = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });

    const timer = setTimeout(() => {
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    }, SCROLL_HOLD_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
    };
  }, []);

  // 초반 스크롤 잠금이 풀린 뒤: 맨 위 상태에서 위로(휠을 위로) 스크롤하면 이전 화면(Altar)으로 돌아감
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (hasGoneBack.current) return;
      if (window.scrollY <= 0 && e.deltaY < 0) {
        hasGoneBack.current = true;
        setIsLeaving(true);

        setTimeout(() => {
          navigate(`/altar/${key}`);
        }, WRAPPER_TRANSITION_MS);
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener("wheel", handleWheel);
    }, SCROLL_HOLD_MS);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [navigate, key]);

  return (
    <Wrapper $isVisible={isVisible} $isLeaving={isLeaving}>
      <AddMemoryButton onClick={() => setIsAddMemoryOpen(true)}>
        + 추념하기
      </AddMemoryButton>

      {isAddMemoryOpen && (
        <AddMemoryCard
          onClose={() => setIsAddMemoryOpen(false)}
          onSubmit={() => {
            setIsAddMemoryOpen(false);
            setToastMessage(
              "기억을 남겨주셔서 감사합니다.\n남겨주신 기억은 유족에게 소중히 전달됩니다."
            );
          }}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      <TitleGroup>
        <TitleStack>
          <Title>추념</Title>
          <Hanja>追念</Hanja>
        </TitleStack>
        <Title>공간</Title>
      </TitleGroup>
      <Canvas>
        {photos.map((photo) => (
          <PhotoCell
            key={photo.id}
            style={{
              gridColumn: `span ${photo.colSpan}`,
              gridRow: `span ${photo.rowSpan}`,
            }}
          >
            <PhotoItem
              src={photo.src}
              rotate={photo.rotate}
              index={photo.id}
              onClick={() =>
                setSelectedPhoto({
                  src: photo.src,
                  name: photo.name,
                  message: photo.message,
                })
              }
            />
          </PhotoCell>
        ))}
      </Canvas>

      {selectedPhoto && (
        <MemoryViewModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </Wrapper>
  );
}

const TOAST_VISIBLE_MS = 2500; // 토스트가 화면에 떠 있는 시간
const TOAST_TRANSITION_MS = 300; // 토스트가 뜨고 사라질 때의 애니메이션 시간

// 화면 가운데에 잠깐 떴다가 스스로 사라지는 토스트(안내 문구)
// message에 "\n"이 있으면 줄바꿈되고, 첫 줄만 더 크게 강조돼서 보임
function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [firstLine, ...restLines] = message.split("\n");

  useEffect(() => {
    const showId = requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = setTimeout(() => setIsVisible(false), TOAST_VISIBLE_MS);
    const removeTimer = setTimeout(onDismiss, TOAST_VISIBLE_MS + TOAST_TRANSITION_MS);

    return () => {
      cancelAnimationFrame(showId);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  // document.body로 바로 렌더링(Portal)해야, Wrapper의 transform에 영향받지 않고
  // 항상 "현재 보이는 화면" 기준으로 정확히 뜸(스크롤 위치와 무관하게)
  return createPortal(
    <ToastOverlay>
      <ToastBox $isVisible={isVisible}>
        <ToastTitle>{firstLine}</ToastTitle>
        {restLines.map((line, i) => (
          <ToastDescription key={i}>{line}</ToastDescription>
        ))}
      </ToastBox>
    </ToastOverlay>,
    document.body
  );
}

// 사진 하나하나가 "실제로 화면(뷰포트)에 들어왔을 때" 스스로 나타나는 컴포넌트.
// 처음부터 보이는 사진들은 바로 나타나고, 스크롤해서 새로 들어오는 사진은 그때 나타남.
function PhotoItem({
  src,
  rotate,
  index,
  onClick,
}: {
  src: string;
  rotate: number;
  index: number;
  onClick: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        // 처음 화면에 걸쳐있는 사진들은 전부 "동시에" 감지되기 때문에,
        // 순서(index)에 따라 조금씩 더 늦게 + 랜덤 시차까지 더해서 한꺼번에 몰리지 않게 함
        const cascadeDelay = index * CASCADE_STEP_MS + Math.random() * STAGGER_MS;
        setTimeout(() => setRevealed(true), cascadeDelay);

        observer.disconnect(); // 한 번 나타나면 더 지켜볼 필요 없음
      },
      { threshold: 0.15 } // 15% 정도 보이기 시작하면 등장
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <PhotoBloom
      ref={imgRef}
      src={src}
      alt="조문객이 남긴 사진. 눌러서 남긴 글 보기"
      decoding="async"
      $revealed={revealed}
      $rotate={rotate}
      onClick={onClick}
    />
  );
}

const MODAL_TRANSITION_MS = 250; // 추념하기 팝업과 같은 속도

// 사진을 클릭하면 조문객이 남긴 글을 크게 보여주는 팝업
function MemoryViewModal({
  photo,
  onClose,
}: {
  photo: { src: string; name: string; message: string };
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, MODAL_TRANSITION_MS);
  };

  // Portal로 document.body에 직접 렌더링(이유는 Toast와 동일)
  return createPortal(
    <ViewOverlay $isVisible={isVisible} onClick={handleClose}>
      <ViewCard $isVisible={isVisible} onClick={(e) => e.stopPropagation()}>
        <ViewCloseButton onClick={handleClose} aria-label="닫기">
          ×
        </ViewCloseButton>

        <ViewPhoto src={photo.src} alt={`${photo.name}님이 남긴 사진`} />
        <ViewName>{photo.name}</ViewName>
        <ViewMessage>{photo.message}</ViewMessage>
      </ViewCard>
    </ViewOverlay>,
    document.body
  );
}

const ToastOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60; /* 추억 남기기 팝업(50)보다 위, 팝업이 닫힌 뒤에 뜨므로 겹칠 일은 없음 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  pointer-events: none; /* 뒤에 있는 화면 클릭/스크롤을 막지 않음 */
`;

const ToastBox = styled.div<{ $isVisible: boolean }>`
  max-width: 360px;
  background: #5c4a36; /* 불투명한 어두운 베이지 */
  color: #ffffff;
  text-align: center;
  padding: 22px 28px;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);

  transition: opacity ${TOAST_TRANSITION_MS}ms ease, transform ${TOAST_TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: scale(${({ $isVisible }) => ($isVisible ? 1 : 0.92)});
`;

const ToastTitle = styled.p`
  font-size: 17px;
  font-weight: 700;
  line-height: 1.5;
  margin: 0 0 4px;
`;

const ToastDescription = styled.p`
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
`;

const Wrapper = styled.div<{ $isVisible: boolean; $isLeaving: boolean }>`
  min-height: 100vh;
  background: #ffffff; /* Altar(직전 화면)와 같은 배경색. Wrapper가 전체 콘텐츠를 감싸므로 스크롤을 내려도 계속 유지됨 */
  display: flex;
  flex-direction: column;
  align-items: center;

  /* 처음엔 아래에서 위로 스르륵 올라오며 나타나고,
     맨 위에서 더 위로 스크롤하면(뒤로가기) 반대로 위로 사라짐 */
  transition: opacity ${WRAPPER_TRANSITION_MS}ms ease, transform ${WRAPPER_TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible, $isLeaving }) => (!$isVisible || $isLeaving ? 0 : 1)};
  transform: translateY(${({ $isVisible, $isLeaving }) => {
    if (!$isVisible) return "40px"; // 등장 전
    if ($isLeaving) return "-40px"; // 뒤로가기: 위로 사라짐
    return "0";
  }});
`;

const AddMemoryButton = styled.button`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #a9834f;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(169, 131, 79, 0.35);
  transition: background 0.15s ease;

  &:hover {
    background: #96733f;
  }
`;

const TitleGroup = styled.div`
  margin: 48px 0 24px;
  display: flex;
  align-items: flex-start; /* 추념/공간이 같은 줄의 윗선에 나란히 맞춰지도록 */
  justify-content: center;
  gap: 10px;
`;

const TitleStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 28px; /* 기존 22px보다 키움 */
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
`;

const Hanja = styled.p`
  font-size: 28px; /* 추념과 같은 크기 */
  font-weight: 700;
  color: #9c9691; /* 회색빛 */
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
`;

// 화면을 꽉 채우는 그리드. auto-fill이라 화면 너비에 맞춰 칸 개수가 자동으로 조절됨
const Canvas = styled.div`
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 40px; /* 화면 동서남북 여백 */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${MIN_CELL}px, 1fr));
  grid-auto-rows: ${MIN_CELL}px;
  grid-auto-flow: dense; /* 빈 칸이 생기지 않도록 채워 넣음 */
`;

const PhotoCell = styled.div`
  padding: 16px; /* 여백을 넉넉히 둬서 사진이 기울어져도 옆 칸과 절대 안 겹치게 함 */
  overflow: hidden;
`;

const PhotoBloom = styled.img<{ $revealed: boolean; $rotate: number }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  cursor: pointer; /* 클릭해서 글 보기 */
  will-change: transform, opacity; /* 브라우저가 이 두 속성을 미리 최적화해두도록 힌트를 줌 */

  /* 물감이 톡 떨어져서 몽글몽글 퍼지는 느낌: 작고 흐릿하게 시작 → 커지면서 또렷해짐 + 살짝 기울어짐 */
  transform: scale(${({ $revealed }) => ($revealed ? 1 : 0.15)})
    rotate(${({ $revealed, $rotate }) => ($revealed ? `${$rotate}deg` : "0deg")});
  opacity: ${({ $revealed }) => ($revealed ? 1 : 0)};
  filter: blur(${({ $revealed }) => ($revealed ? "0px" : "10px")});
  border-radius: ${({ $revealed }) => ($revealed ? "16px" : "50%")};

  /* transform·opacity는 가벼워서 오래 끌어도 되지만,
     filter/border-radius는 무거운 연산이라 짧게 끝내야 사진이 많아도 안 밀림 */
  transition: transform ${TRANSFORM_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity ${FADE_MS}ms ease,
    filter ${HEAVY_EFFECT_MS}ms ease,
    border-radius ${HEAVY_EFFECT_MS}ms ease;
`;

const ViewOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 55; /* 추념하기 팝업(50)보다 위, 토스트(60)보다는 아래 */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;

  background: rgba(0, 0, 0, 0.45);
  transition: opacity ${MODAL_TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
`;

const ViewCard = styled.div<{ $isVisible: boolean }>`
  position: relative;
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  padding: 32px;
  text-align: center;
  box-sizing: border-box;

  transition: opacity ${MODAL_TRANSITION_MS}ms ease, transform ${MODAL_TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: scale(${({ $isVisible }) => ($isVisible ? 1 : 0.94)});
`;

const ViewCloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #828282;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #f4f2ec;
    color: #1a1a1a;
  }
`;

const ViewPhoto = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 14px;
  display: block;
  margin: 0 0 20px;
`;

const ViewName = styled.p`
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px;
`;

const ViewMessage = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: #666666;
  margin: 0;
  white-space: pre-line;
`;
