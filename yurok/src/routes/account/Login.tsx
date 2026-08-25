import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';


// ==========================================
// 2. React Component implementation
// ==========================================
interface LoginProps {
  onHomeClick?: () => void;
  onSignUpClick?: () => void;
  onKakaoLoginClick?: () => void;
  showNotice?: boolean;
}

export default function Login({
  onHomeClick,
  onSignUpClick,
  onKakaoLoginClick,
  showNotice = false,
}: LoginProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 로그인 처리 로직 수행
    console.log('Login attempt:', { email, password });
  };

  return (
    <>
      <FlowPage id="login">

        <FlowBody>
          <AuthCard>
            <Eyebrow>FAMILY LOGIN</Eyebrow>
            <h1>
              유족 관리자로
              <br />
              로그인해주세요.
            </h1>
            <p>신청한 온라인 빈소와 조문객 방명록을 관리할 수 있습니다.</p>

            {showNotice && (
              <LoginNotice id="login-notice">
                온라인 빈소를 신청하려면 먼저 로그인해주세요.
              </LoginNotice>
            )}

            <Form id="login-form" onSubmit={handleSubmit}>
              <Field>
                <span>이메일</span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <span>비밀번호</span>
                <input
                  type="password"
                  placeholder="비밀번호를 입력해주세요"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <AuthSubmit type="submit">로그인</AuthSubmit>
            </Form>

            <JoinButton type="button" onClick={onKakaoLoginClick}>
              회원가입
            </JoinButton>
          </AuthCard>
        </FlowBody>
      </FlowPage>
    </>
  );
}

// ==========================================
// 3. Styled Components (하단배치 & 세미콜론 후 줄바꿈)
// ==========================================

const FlowPage = styled.section`
  min-height: 100vh;
  background-color: #eee9df;
  background-image: radial-gradient(#cbc3b7 0.7px, transparent 0.7px);
  background-size: 6px 6px;
  text-align: left;
`;

const FlowBody = styled.div`
  min-height: calc(100vh - 78px);
  display: grid;
  place-items: center;
  /* padding: 55px; */
`;

const AuthCard = styled.div`
  width: 520px;
  padding: 52px;
  border: 1px solid #b6aa9d;
  background: #fffdfa;
  box-shadow: 0 25px 70px rgba(66, 49, 37, 0.13);
  margin-top: 40px;

  h1 {
    margin: 0 0 10px;
    font: 400 31px/1.45 "Batang", serif;
    letter-spacing: -0.04em;
  }

  p:not(.eyebrow) {
    margin: 0 0 30px;
    color: #756c62;
    font-size: 11px;
    line-height: 1.7;
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 12px;
  color: #7b6e61;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
`;

const LoginNotice = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #c9bcae;
  color: #6d5e50;
  background: #f3ece3;
  font-size: 9px;
  text-align: center;
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;

  span {
    font-size: 10px;
    font-weight: 700;
  }

  input {
    width: 100%;
    height: 44px;
    padding: 0 12px;
    border: 1px solid #c3b9ae;
    background: #fff;
    outline: none;

    &:focus {
      border-color: var(--brown);
      box-shadow: 0 0 0 2px #e9ded1;
    }
  }
`;

const AuthSubmit = styled.button`
  height: 49px;
  margin-top: 24px;
  border: 1px solid #463226;
  color: white;
  background: #463226;
  font-weight: 700;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: #2f221b;
    transform: translateY(-1px);
  }

  &:disabled {
    border-color: #bbb4ab;
    background: #bbb4ab;
    cursor: not-allowed;
  }
`;

const JoinButton = styled.button`
  width: 100%;
  height: 44px;
  border: 1px solid #c5baad;
  background: #f8f4ed;
  color: #50483f;
  margin-top: 12px;
`;