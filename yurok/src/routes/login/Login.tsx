import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";

const API_BASE = import.meta.env.VITE_API_URL;

// 실제 로그인 API(POST /api/users/login)와 연동됨.
// 로그인 성공 후 이동할 "유족 관리" 화면이 아직 없어서, 지금은 임시로 메인으로 보냄.
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const canSubmit = !!email.trim() && !!password.trim() && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || "이메일 또는 비밀번호를 확인해주세요.");
                return;
            }

            // TODO: 유족 관리 화면이 생기면 그쪽으로 이동시키기
            navigate("/");
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
                <Description>가입하신 이메일과 비밀번호로 다시 로그인해주세요.</Description>

                <FieldGroup>
                    <Label>이메일</Label>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FieldGroup>

                <FieldGroup>
                    <Label>비밀번호</Label>
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FieldGroup>

                {error && <ErrorText>{error}</ErrorText>}

                <SubmitButton onClick={handleSubmit} disabled={!canSubmit}>
                    {isSubmitting ? "로그인 중..." : "로그인 →"}
                </SubmitButton>

                <BackLink to="/">← 메인으로</BackLink>
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
  color: #828282;
  text-align: center;
  margin: 0 0 32px;
`;

const FieldGroup = styled.div`
  margin-bottom: 20px;
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
  margin: 0 0 16px;
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
