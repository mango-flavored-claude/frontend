import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Toast, { type ToastVariant } from '../../components/Toast';

// 유족 회원가입 API: POST /api/users/signup
const API_BASE = import.meta.env.VITE_API_URL;

const AFTER_SUCCESS_DELAY_MS = 1200; // 토스트를 잠깐 보여준 뒤 로그인 화면으로 이동

// ==========================================
// 2. React Component implementation
// ==========================================
export default function SignUp() {
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          email,
          password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setToast({ message: '회원가입이 완료되었습니다.', variant: 'success' });
        setTimeout(() => navigate('/login'), AFTER_SUCCESS_DELAY_MS);
      } else {
        setToast({
          message: data.message || '회원가입에 실패했습니다. 다시 시도해주세요.',
          variant: 'error',
        });
      }
    } catch {
      setToast({ message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FlowPage id="signup">
      <FlowBody>
        <AuthCard>
          <Eyebrow>FAMILY SIGN UP</Eyebrow>
          <h1>
            유족 관리자로
            <br />
            가입해주세요.
          </h1>
          <p>온라인 빈소를 신청하고 조문객 방명록을 관리하려면 회원가입이 필요합니다.</p>

          <Form id="signup-form" onSubmit={handleSubmit}>
            <Field>
              <span>이름</span>
              <input
                id="signup-name"
                type="text"
                placeholder="홍길동"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field>
              <span>전화번호</span>
              <input
                id="signup-phone"
                type="tel"
                inputMode="numeric"
                placeholder="010-1234-5678"
                required
                maxLength={13}
                value={phoneNumber}
                onChange={handlePhoneChange}
              />
            </Field>

            <Field>
              <span>이메일</span>
              <input
                id="signup-email"
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
                id="signup-password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            <AuthSubmit type="submit" disabled={isSubmitting}>
              {isSubmitting ? '가입 처리 중...' : '회원가입'}
            </AuthSubmit>
          </Form>

          <BackToLogin to="/login">이미 계정이 있으신가요? 로그인</BackToLogin>
        </AuthCard>
      </FlowBody>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </FlowPage>
  );
}

// ==========================================
// 3. Styled Components (Login.tsx와 톤 맞춤)
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

const BackToLogin = styled(Link)`
  display: block;
  width: 100%;
  height: 44px;
  line-height: 44px;
  text-align: center;
  border: 1px solid #c5baad;
  background: #f8f4ed;
  color: #50483f;
  margin-top: 12px;
  text-decoration: none;
  box-sizing: border-box;
`;
