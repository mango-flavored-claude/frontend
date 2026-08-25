import styled from "styled-components";
import { Link, useParams } from "react-router-dom";

// TODO: 실제로 추억(사진/글) 등록까지 만들고 나면,
// 등록 버튼을 눌렀을 때 "소중한 추억이 등록되었습니다" 같은 스낵바(토스트)를 띄워줘야 함.
// 지금은 MemorialCard와 같은 카드 형식으로 틀만 먼저 잡아둠.
export default function AddMemoryCard() {
  const { key } = useParams<{ key: string }>();

  return (
    <Wrapper>
      <Card>
        <Title>소중한 추억을 남겨주세요</Title>
        <Description>
          {"사진과 함께 마음을 담은 이야기를 남겨주시면\n소중한 분들과 오래도록 기억하겠습니다."}
        </Description>
        <ButtonGroup>
          <EnterButton to={`/next/${key}`}>추억모음으로 돌아가기 →</EnterButton>
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
