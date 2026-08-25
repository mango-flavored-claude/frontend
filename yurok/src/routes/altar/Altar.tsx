import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";

const TRANSITION_MS = 400; // 등장/사라지는 애니메이션 시간(아래 CSS transition 시간과 맞춰야 함)

export default function Altar() {
    const navigate = useNavigate();
    const { key } = useParams<{ key: string }>();
    const hasNavigated = useRef(false); // 다음 페이지로 중복 이동하지 않도록 막는 플래그
    const [isVisible, setIsVisible] = useState(false); // 등장 애니메이션 시작 여부
    const [isLeaving, setIsLeaving] = useState(false); // 퇴장 애니메이션 시작 여부

    useEffect(() => {
        // 마운트되자마자 true로 바꿔야 transition이 애니메이션으로 재생됨
        const id = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);

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
            Test
        </Wrapper>
    );
}

// TODO: 실제 내용이 정해지기 전까지는 스크롤 테스트를 위한 임시 높이입니다.
const Wrapper = styled.div<{ $isVisible: boolean; $isLeaving: boolean }>`
  min-height: 200vh;
  background: #ffffff; /* NextPage(다음 화면)와 같은 배경색으로 명시적으로 맞춰둠 */
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
