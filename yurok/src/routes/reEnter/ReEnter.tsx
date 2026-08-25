import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import styled from "styled-components";

// TODO: 지금은 서버에 전화번호를 확인할 API가 없어서, 입력만 하면 통과되는 더미 검증임.
// 나중에 "이 번호로 방명록을 작성한 적이 있는지" 확인하는 API가 생기면 여기서 검증해야 함.
export default function ReEnter() {
    const [phone, setPhone] = useState("");
    const navigate = useNavigate();
    const { key } = useParams<{ key: string }>();

    const canSubmit = !!phone.trim();

    const handleSubmit = () => {
        if (!canSubmit) return;
        navigate(`/altar/${key}`);
    };

    return (
        <Wrapper>
            <Card>
                <Title>재입장</Title>
                <Description>
                    {"방명록 작성 시 입력하셨던 전화번호를\n입력해주시면 다시 입장하실 수 있습니다."}
                </Description>

                <FieldGroup>
                    <Label>연락처</Label>
                    <Input
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </FieldGroup>

                <SubmitButton onClick={handleSubmit} disabled={!canSubmit}>
                    재입장하기 →
                </SubmitButton>

                <BackLink to={`/intro/${key}`}>← 돌아가기</BackLink>
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
  max-width: 420px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  padding: 40px 44px 44px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #1a1a1a;
  text-align: center;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
`;

const Description = styled.p`
  font-size: 13.5px;
  line-height: 1.7;
  color: #828282;
  text-align: center;
  white-space: pre-line;
  margin: 0 0 32px;
`;

const FieldGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 10px;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 13px 16px;
  font-size: 14.5px;
  color: #1a1a1a;
  background: #f7f6f2;
  border: 1px solid #ece9e1;
  border-radius: 10px;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: #b5b0a5;
  }

  &:focus {
    border-color: #c9a063;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #a9834f;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;

  &:hover {
    background: #96733f;
  }

  &:disabled {
    background: #d8cbb2;
    cursor: not-allowed;
  }
`;

const BackLink = styled(Link)`
  display: block;
  width: fit-content;
  margin: 20px auto 0;
  color: #828282;
  font-size: 13.5px;
  text-decoration: none;

  &:hover {
    color: #1a1a1a;
  }
`;
