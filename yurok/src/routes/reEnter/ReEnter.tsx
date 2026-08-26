import { useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { saveVisitor } from "../../utils/visitorStorage";
import { useInviteToken } from "../../hooks/useInviteToken";
import { API_BASE_URL as API_BASE } from "../../utils/api";

// 조문객 재입장 API: POST /api/memorials/{inviteToken}/visitors/reentry
export default function ReEnter() {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const key = useInviteToken();

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11);

        if (digits.length < 4) return digits;
        if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        if (digits.length === 11) {
            return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
        }
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    const canSubmit = !!phone.trim() && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/memorials/${key}/visitors/reentry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || "등록된 연락처를 찾을 수 없습니다. 다시 확인해주세요.");
                return;
            }

            saveVisitor(data.result);
            navigate(`/park/${key}`);
        } catch {
            setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
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
                        inputMode="numeric"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={13}
                    />
                </FieldGroup>

                {error && <ErrorText>{error}</ErrorText>}

                <SubmitButton onClick={handleSubmit} disabled={!canSubmit}>
                    {isSubmitting ? "확인 중..." : "재입장하기 →"}
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

const ErrorText = styled.p`
  font-size: 13px;
  color: #c0392b;
  margin: -8px 0 16px;
  text-align: center;
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
