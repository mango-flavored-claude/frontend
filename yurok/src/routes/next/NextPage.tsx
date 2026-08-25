import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

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

// 사진마다 위치/크기/기울기를 무작위로 미리 계산해둠
// (렌더링마다 바뀌면 계속 움직여 보이므로, 한 번만 계산되도록 useMemo로 고정)
function generatePhotoLayout() {
  return Array.from({ length: PHOTO_COUNT }).map((_, i) => ({
    id: i,
    src: `https://picsum.photos/seed/altar${i}/400/400`,
    colSpan: randomSpan(),
    rowSpan: randomSpan(),
    rotate: Math.random() * 10 - 5, // -5 ~ 5도로 살짝 삐뚤게
  }));
}

export default function NextPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false); // 위로 스크롤해서 이전 화면으로 돌아가는 중인지
  const photos = useMemo(generatePhotoLayout, []);
  const navigate = useNavigate();
  const { key } = useParams<{ key: string }>();
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
      <AddMemoryButton onClick={() => navigate(`/addMemory/${key}`)}>
        + 추억 남기기
      </AddMemoryButton>

      <Title>고인과 함께한 소중한 순간들</Title>
      <Canvas>
        {photos.map((photo) => (
          <PhotoCell
            key={photo.id}
            style={{
              gridColumn: `span ${photo.colSpan}`,
              gridRow: `span ${photo.rowSpan}`,
            }}
          >
            <PhotoItem src={photo.src} rotate={photo.rotate} index={photo.id} />
          </PhotoCell>
        ))}
      </Canvas>
    </Wrapper>
  );
}

// 사진 하나하나가 "실제로 화면(뷰포트)에 들어왔을 때" 스스로 나타나는 컴포넌트.
// 처음부터 보이는 사진들은 바로 나타나고, 스크롤해서 새로 들어오는 사진은 그때 나타남.
function PhotoItem({ src, rotate, index }: { src: string; rotate: number; index: number }) {
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
      alt=""
      decoding="async"
      $revealed={revealed}
      $rotate={rotate}
    />
  );
}

const Wrapper = styled.div<{ $isVisible: boolean; $isLeaving: boolean }>`
  min-height: 100vh;
  background: #f9f8f6;
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

const Title = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  letter-spacing: -0.02em;
  margin: 48px 0 8px;
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
