import { useState } from "react";
import styled from "styled-components";

export default function GuestbookForm() {
    const [name, setName] = useState("");
    const [relation, setRelation] = useState("");
    const [phone, setPhone] = useState("");

    const handleSubmit = () => {
        if (!name.trim() || !relation.trim() || !phone.trim()) return;
    };

    return (
        <Wrapper>
            <Card>
                <Title>방명록 작성</Title>

                <FieldGroup>
                    <Label>성함</Label>
                    <Input
                        type="text"
                        placeholder="홍길동"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label>고인과의 관계</Label>
                    <Input
                        type="text"
                        placeholder="홍길동"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label>연락처</Label>
                    <Input
                        type="text"
                        placeholder="홍길동"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </FieldGroup>

                <SubmitButton onClick={handleSubmit} disabled={!name.trim() || !relation.trim() || !phone.trim()}>
                    헌화하기 →
                </SubmitButton>
            </Card>
        </Wrapper>
    );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #F9F8F6;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  padding: 40px 44px 44px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #1A1A1A;
  text-align: center;
  margin: 0 0 32px;
  letter-spacing: -0.01em;
`;

const FieldGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: bold;
  color: #1A1A1A;
  margin-bottom: 10px;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 13px 16px;
  font-size: 14.5px;
  color: #1A1A1A;
  background: #F7F6F2;
  border: 1px solid #ECE9E1;
  border-radius: 10px;
  outline: none;
  font-family: inherit;

  &::placeholder {
    color: #B5B0A5;
  }

  &:focus {
    border-color: #C9A063;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 16px;
  padding: 16px;
  background: #A9834F;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;

  &:hover {
    background: #96733F;
  }

  &:disabled {
    background: #D8CBB2;
    cursor: not-allowed;
  }
`;