import styled from "styled-components";
import { Link, useParams } from "react-router-dom";

export default function MemorialCard() {
  const { key } = useParams<{ key: string }>();

  return (
    <Wrapper>
      <Card>
        <Title>마음을 전하는 기억의 자리</Title>
        <Description>
          {"바쁘신 와중에도 "}
          <HanjaMark>故</HanjaMark>
          {` 김철수님의 명복을 빌어주시는\n모든 분들께 진심으로 감사드립니다.\n따뜻한 추억과 조의의 마음을 이곳에 남겨주세요.`}
        </Description>
        <ButtonGroup>
          <EnterButton to={`/guestBookForm/${key}`}>
            방명록 작성하고 입장 →
          </EnterButton>
          <ReEnterButton to="/">재입장 →</ReEnterButton>
        </ButtonGroup>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f9f8f6;
`;

const Card = styled.div`
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  padding: 56px 48px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 700;
  font-family: inherit;
  color: #1a1a1a;
  margin: 0 0 24px;
  letter-spacing: -0.02em;
`;

const Description = styled.p`
  font-size: 14.5px;
  line-height: 1.8;
  color: #828282;
  margin: 0 0 36px;
  white-space: pre-line;
`;

const HanjaMark = styled.span`
  color: #828282;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const EnterButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1a1a1a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 14px 24px;
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  text-decoration: none;

  &:hover {
    background: #333333;
  }
`;

const ReEnterButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #828282;
  /* border: 1px solid #e0ddd4; */
  border-radius: 10px;
  padding: 14px 24px;
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;

  &:hover {
    background: #f4f2ec;
    color: #1a1a1a;
  }
`;