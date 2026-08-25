import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { saveVisitor } from "../../utils/visitorStorage";
import { useInviteToken } from "../../hooks/useInviteToken";

// 조문객 첫 입장 API: POST /api/memorials/{inviteToken}/visitors
// 조의금 계좌 조회: GET /api/memorials/{inviteToken}/account
const API_BASE = import.meta.env.VITE_API_URL;

const BANK_NAMES: Record<string, string> = {
    KB_KOOKMIN: "KB국민은행",
    SHINHAN: "신한은행",
    WOORI: "우리은행",
    HANA: "하나은행",
    NH: "NH농협은행",
    IBK: "IBK기업은행",
    KAKAO_BANK: "카카오뱅크",
    TOSS_BANK: "토스뱅크",
};

interface MemorialAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}

export default function GuestbookForm() {
    const key = useInviteToken();

    const [name, setName] = useState("");
    const [relation, setRelation] = useState("");
    const [phone, setPhone] = useState("");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [account, setAccount] = useState<MemorialAccount | null>(null);

    const navigator = useNavigate();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(`${API_BASE}/api/memorials/${key}/account`);
                const data = await res.json();
                if (!cancelled && res.ok && data.success) setAccount(data.result);
            } catch {
                // 계좌 조회 실패해도 방명록 작성 자체는 가능해야 하니, 안내 영역만 안 뜨고 넘어감
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [key]);

    const formatPhoneNumber = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 11);

        if (digits.length < 4) {
            return digits;
        }
        if (digits.length < 8) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        if (digits.length === 11) {
            return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
        }
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhoneNumber(e.target.value));
    };

    const handleCopyAccount = async () => {
        if (!account) return;
        try {
            // await navigator.clipboard.writeText(account.accountNumber.replace(/-/g, ""));
            // setCopied(true);
            // setTimeout(() => setCopied(false), 1500);
        } catch (err) {
            console.error("복사 실패", err);
        }
    };

    const canSubmit = !!name.trim() && !!relation.trim() && !!phone.trim() && !isSubmitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/memorials/${key}/visitors`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    relationship: relation,
                    phone: phone.replace(/\D/g, ""), // "010-1234-5678" → "01012345678"
                }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || "방명록 등록에 실패했습니다. 다시 시도해주세요.");
                return;
            }

            // 추억 작성 등에서 다시 써야 하므로 visitorId를 저장해둠
            saveVisitor(data.result);

            navigator(`/altar/${key}`);
        } catch {
            setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
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
                        type="tel"
                        inputMode="numeric"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={13}
                    />
                </FieldGroup>

                {account && (
                    <>
                        <Divider />

                        <AccountSection>
                            <AccountTitle>조의를 전하고 싶은 분들께</AccountTitle>
                            <AccountSubtitle>
                                마음을 전하고 싶으신 분들을 위해 유족의 계좌를 안내드립니다.
                            </AccountSubtitle>

                            <AccountCard>
                                <AccountInfo>
                                    <AccountBank>
                                        {BANK_NAMES[account.bankName] ?? account.bankName} {account.accountHolder}
                                    </AccountBank>
                                    <AccountNumber>{account.accountNumber}</AccountNumber>
                                </AccountInfo>
                                <CopyButton onClick={handleCopyAccount}>
                                    {copied ? "복사됨" : "복사"}
                                </CopyButton>
                            </AccountCard>
                        </AccountSection>
                    </>
                )}

                {error && <ErrorText>{error}</ErrorText>}

                <SubmitButton onClick={handleSubmit} disabled={!canSubmit}>
                    {isSubmitting ? "등록 중..." : "헌화하기 →"}
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
  padding: 10px 44px 10px;
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

const Divider = styled.div`
  height: 1px;
  background: #ECE9E1;
  margin: 8px 0 28px;
`;

const AccountSection = styled.div`
  margin-bottom: 28px;
  text-align: center;
`;

const AccountTitle = styled.h2`
  font-size: 15.5px;
  font-weight: bold;
  color: #1A1A1A;
  margin: 0 0 8px;
`;

const AccountSubtitle = styled.p`
  font-size: 12.5px;
  color: #9B968C;
  line-height: 1.6;
  margin: 0 0 18px;
`;

const AccountCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F7F6F2;
  border: 1px solid #ECE9E1;
  border-radius: 12px;
  padding: 14px 16px;
  text-align: left;
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AccountBank = styled.span`
  font-size: 13.5px;
  font-weight: bold;
  color: #1A1A1A;
`;

const AccountNumber = styled.span`
  font-size: 13px;
  color: #6B6862;
`;

const CopyButton = styled.button`
  flex-shrink: 0;
  padding: 9px 16px;
  font-size: 12.5px;
  font-weight: 500;
  color: #1A1A1A;
  background: #FFFFFF;
  border: 1px solid #E0DDD4;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    background: #F0EEE8;
  }
`;

const ErrorText = styled.p`
  font-size: 13px;
  color: #C0392B;
  margin: -8px 0 16px;
  text-align: center;
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