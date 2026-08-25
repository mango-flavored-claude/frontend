import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/yurok_homepage.png";
import portraitDemo from "../../assets/potrait_demo.png";
import { useInviteToken } from "../../hooks/useInviteToken";
import { API_BASE_URL as API_BASE } from "../../utils/api";

// yurok_homepage.png(1672×941) 안 빈 액자의 실제 위치를 픽셀 분석해서 구한 좌표(%)
// (액자 안쪽 테두리 기준: 가로 705~962px, 세로 93~403px)
const FRAME = { left: 42.16, top: 9.88, width: 15.37, height: 32.94 };

const TRANSITION_MS = 400; // 등장/사라지는 애니메이션 시간(아래 CSS transition 시간과 맞춰야 함)

// 영정사진 조회 API: GET /api/memorials/{inviteToken}/portrait (S3 presigned URL, 일정 시간 뒤 만료됨)
// 빈소 메인 조회 API: GET /api/memorials/{inviteToken}
interface MemorialHome {
    deceasedName: string;
    birthDate: string;
    deathDate: string;
}

export default function Altar() {
    const navigate = useNavigate();
    const key = useInviteToken();
    const hasNavigated = useRef(false); // 다음 페이지로 중복 이동하지 않도록 막는 플래그
    const [isVisible, setIsVisible] = useState(false); // 등장 애니메이션 시작 여부
    const [isLeaving, setIsLeaving] = useState(false); // 퇴장 애니메이션 시작 여부
    // 실제 영정사진 URL을 못 받아오면(아직 없거나 요청 실패) 데모 이미지로 대체
    const [portraitUrl, setPortraitUrl] = useState(portraitDemo);
    const [memorial, setMemorial] = useState<MemorialHome | null>(null);

    useEffect(() => {
        // 마운트되자마자 true로 바꿔야 transition이 애니메이션으로 재생됨
        const id = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/memorials/${key}/portrait`);
                const data = await res.json();
                if (!cancelled && res.ok && data.success && data.result?.imageUrl) {
                    setPortraitUrl(data.result.imageUrl);
                }
            } catch {
                // 실패해도 데모 이미지로 그대로 보여주면 되니 별도 에러 처리 없음
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [key]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/memorials/${key}`);
                const data = await res.json();
                if (!cancelled && res.ok && data.success) {
                    setMemorial(data.result);
                }
            } catch {
                // 실패해도 왼쪽 상단 정보 UI만 안 뜨면 되니 별도 에러 처리 없음
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [key]);

    // NextPage에서 위로 스크롤해 돌아왔을 때, 그쪽 스크롤 위치가 이어지지 않도록 맨 위로 초기화
    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (hasNavigated.current) return;

            // 스크롤을 한 번이라도 굴리면(살짝만 움직여도) 애니메이션 시작
            if (window.scrollY > 0) {
                hasNavigated.current = true;
                setIsLeaving(true);

                // 애니메이션이 끝난 뒤에 실제 페이지 이동
                setTimeout(() => {
                    navigate(`/next/${key}`);
                }, TRANSITION_MS);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [navigate, key]);

    return (
        <Wrapper $isVisible={isVisible} $isLeaving={isLeaving}>
            <Scene>
                <SceneBackground src={backgroundImage} alt="빈소 배경" />
                <Portrait src={portraitUrl} alt="고인 영정사진" />
            </Scene>

            {memorial && (
                <InfoBox>
                    <InfoName>
                        <HanjaMark>故</HanjaMark> {memorial.deceasedName}
                    </InfoName>
                    <InfoDates>
                        {memorial.birthDate.replaceAll("-", ".")} ~{" "}
                        {memorial.deathDate.replaceAll("-", ".")}
                    </InfoDates>
                </InfoBox>
            )}

            <ScrollHint>
                <ScrollHintText>
                    아래로 스크롤하여{"\n"}고인의 풍경과 추억을 함께해주세요
                </ScrollHintText>
                <ScrollArrow>↓</ScrollArrow>
            </ScrollHint>
        </Wrapper>
    );
}

// TODO: 실제 내용(버튼 등)이 정해지기 전까지는 배경 사진 + 스크롤 안내만 채워둔 상태이고,
// 스크롤 테스트를 위한 임시 높이(200vh)도 그대로 유지 중입니다.
const Wrapper = styled.div<{ $isVisible: boolean; $isLeaving: boolean }>`
  position: relative; /* 안의 ScrollHint를 첫 화면(100vh) 기준으로 배치하기 위한 기준점 */
  min-height: 200vh;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding-top: 40px;

  /* 처음엔 위에서 아래로 스르륵 내려오며 나타나고,
     스크롤 트리거되면 반대로 아래로 밀리면서 서서히 사라짐 */
  transition: opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible, $isLeaving }) => (!$isVisible || $isLeaving ? 0 : 1)};
  transform: translateY(${({ $isVisible, $isLeaving }) => {
    if (!$isVisible) return "-40px"; // 등장 전: 위쪽에 있다가 내려옴
    if ($isLeaving) return "40px"; // 퇴장: 아래로 사라짐
    return "0";
  }});
`;

// 배경 사진 + 영정사진을 같은 좌표계로 겹쳐 보여주는 영역.
// 화면(가로/세로)을 무조건 꽉 채우는 최소 크기로 채우고(cover), 비율은 유지한 채
// 넘치는 부분은 잘라냄(참고: 배경 사진 자체가 1672:941=정확히 16:9라 노트북 화면에선 거의 안 잘림).
const Scene = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const SceneBackground = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
`;

const Portrait = styled.img`
  position: absolute;
  left: ${FRAME.left}%;
  top: ${FRAME.top}%;
  width: ${FRAME.width}%;
  height: ${FRAME.height}%;
  object-fit: cover;
`;

// 화면(첫 100vh) 왼쪽 상단에 떠 있는, 빈소 메인 조회 API로 받아온 정보
const InfoBox = styled.div`
  position: absolute;
  left: 32px;
  top: 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoName = styled.p`
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
`;

const HanjaMark = styled.span`
  font-weight: 400;
  opacity: 0.85;
`;

const InfoDates = styled.p`
  margin: 0;
  color: #ffffff;
  font-size: 12.5px;
  opacity: 0.9;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
`;

// 화면(첫 100vh) 맨 아래 가운데에 떠 있는 스크롤 안내
const ScrollHint = styled.div`
  position: absolute;
  left: 50%;
  top: calc(100vh - 96px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const ScrollHintText = styled.p`
  margin: 0;
  color: #ffffff;
  font-size: 13.5px;
  line-height: 1.6;
  text-align: center;
  white-space: pre-line;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
`;

const ScrollArrow = styled.span`
  color: #ffffff;
  font-size: 22px;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
  animation: ${bounce} 1.6s ease-in-out infinite;
`;
