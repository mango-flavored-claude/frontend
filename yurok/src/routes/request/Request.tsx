import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import Toast, { type ToastVariant } from '../../components/Toast';
import { useUser } from '../../store/UserContext';
import { saveMemorial } from '../../utils/memorialStorage';

// 온라인 빈소 생성 API: POST /api/memorials (multipart/form-data)
const API_BASE = import.meta.env.VITE_API_URL;

const BANK_OPTIONS = [
  { value: 'KB_KOOKMIN', label: 'KB국민은행' },
  { value: 'SHINHAN', label: '신한은행' },
  { value: 'WOORI', label: '우리은행' },
  { value: 'HANA', label: '하나은행' },
  { value: 'NH', label: 'NH농협은행' },
  { value: 'IBK', label: 'IBK기업은행' },
  { value: 'KAKAO_BANK', label: '카카오뱅크' },
  { value: 'TOSS_BANK', label: '토스뱅크' },
];

// HTML datetime-local 값("yyyy-MM-ddTHH:mm")에 초를 붙여 서버가 요구하는
// "yyyy-MM-dd'T'HH:mm:ss" 형식으로 맞춤
const toApiDateTime = (value: string) => (value ? `${value}:00` : value);

// 글쓰기 인원(조문 참여 인원 상한) × 공개 보관기간에 따른 요금표
// 바깥 키: 보관기간(년), 안쪽 키: 인원 상한(명)
const PRICE_TABLE: Record<number, Record<number, number>> = {
  1: { 50: 69000, 200: 99000, 500: 139000 },
  5: { 50: 99000, 200: 139000, 500: 189000 },
  10: { 50: 129000, 200: 179000, 500: 239000 },
};

const formatPrice = (value: number) => `${value.toLocaleString('ko-KR')}원`;

interface MemorialCreateResult {
  memorialId: number;
  inviteToken: string;
  inviteUrl: string;
}

// ==========================================
// 2. React Component implementation
// ==========================================
interface RequestProps {
  onHomeClick?: () => void;
  onSubmitComplete?: (data: RequestFormData) => void;
  memberName?: string;
}

export interface RequestFormData {
  deceasedName: string;
  birthDate: string;
  deathDate: string;
  relation: string;
  photo: File | null;
  funeralStartAt: string;
  funeralEndAt: string;
  encoffinmentAt: string;
  departureAt: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  writers: string;
  retention: string;
}

export default function Request({
  onHomeClick,
  onSubmitComplete,
  memberName = 'FAMILY MEMBER',
}: RequestProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  // 개발 편의용: ?step=3 처럼 쿼리로 바로 원하는 단계부터 열 수 있게 함 (없으면 1단계부터)
  const initialStep = (() => {
    const raw = Number(new URLSearchParams(window.location.search).get('step'));
    return raw >= 1 && raw <= 3 ? raw : 1;
  })();
  const [step, setStep] = useState<number>(initialStep);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [createResult, setCreateResult] = useState<MemorialCreateResult | null>(null);
  const [formData, setFormData] = useState<RequestFormData>({
    deceasedName: '',
    birthDate: '',
    deathDate: '',
    relation: '배우자',
    photo: null,
    funeralStartAt: '',
    funeralEndAt: '',
    encoffinmentAt: '',
    departureAt: '',
    bankName: 'KB_KOOKMIN',
    accountNumber: '',
    accountHolder: '',
    writers: '50명',
    retention: '1년',
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // 선택한 인원/보관기간에 맞는 가격을 요금표에서 찾아옴
  const selectedPrice =
    PRICE_TABLE[parseInt(formData.retention, 10)]?.[parseInt(formData.writers, 10)];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      setToast({ message: '로그인이 필요합니다. 다시 로그인해주세요.', variant: 'error' });
      return;
    }
    if (!formData.photo) {
      setToast({ message: '영정사진을 첨부해주세요.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestPayload = {
        ownerId: user.userId,
        deceasedName: formData.deceasedName,
        birthDate: formData.birthDate,
        deathDate: formData.deathDate,
        funeralStartAt: toApiDateTime(formData.funeralStartAt),
        funeralEndAt: toApiDateTime(formData.funeralEndAt),
        encoffinmentAt: toApiDateTime(formData.encoffinmentAt),
        departureAt: toApiDateTime(formData.departureAt),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        memoryLimit: parseInt(formData.writers, 10),
        publicYears: parseInt(formData.retention, 10),
      };

      const body = new FormData();
      body.append(
        'request',
        new Blob([JSON.stringify(requestPayload)], { type: 'application/json' })
      );
      body.append('portrait', formData.photo);

      const res = await fetch(`${API_BASE}/api/memorials`, {
        method: 'POST',
        body, // multipart라 Content-Type은 직접 안 정함(브라우저가 자동으로 boundary 포함해서 설정)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setToast({
          message: data.message || '빈소 생성에 실패했습니다. 다시 시도해주세요.',
          variant: 'error',
        });
        return;
      }

      const result: MemorialCreateResult = data.result;

      setCreateResult(result);
      // memorialId/inviteToken은 다른 화면·API(빈소 조회, 방명록 등)에서도 key로 써야 하니 저장해둠
      saveMemorial(result);
      setIsSubmitted(true);
      onSubmitComplete?.(formData);
    } catch {
      setToast({ message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.', variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {!isSubmitted ? (
        <FlowPage id="application">

          <FlowBody>
            <ApplicationShell>
              <ApplySidebar>
                <h2>온라인 빈소 신청</h2>
                <SideStep $active={step === 1} onClick={() => setStep(1)}>
                  고인 정보
                </SideStep>
                <SideStep $active={step === 2} onClick={() => setStep(2)}>
                  장례 일정
                </SideStep>
                <SideStep $active={step === 3} onClick={() => setStep(3)}>
                  요금제 선택
                </SideStep>
              </ApplySidebar>

              <ApplyCard>
                {/* STEP 01: 고인 정보 */}
                {step === 1 && (
                  <ApplicationPane>
                    <Eyebrow>STEP 01</Eyebrow>
                    <h1>
                      고인 정보를
                      <br />
                      입력해주세요.
                    </h1>
                    <p>입력한 정보는 초대장과 온라인 빈소에 표시됩니다.</p>

                    <FormGroup>
                      <Field>
                        <span>고인 성함</span>
                        <input
                          id="deceased-name"
                          name="deceasedName"
                          placeholder="예: 김유록"
                          value={formData.deceasedName}
                          onChange={handleInputChange}
                        />
                      </Field>

                      <TwoFields>
                        <Field>
                          <span>생년월일</span>
                          <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                          />
                        </Field>
                        <Field>
                          <span>별세일</span>
                          <input
                            type="date"
                            name="deathDate"
                            value={formData.deathDate}
                            onChange={handleInputChange}
                          />
                        </Field>
                      </TwoFields>

                      <Field>
                        <span>신청자와의 관계</span>
                        <select
                          name="relation"
                          value={formData.relation}
                          onChange={handleInputChange}
                        >
                          <option value="배우자">배우자</option>
                          <option value="자녀">자녀</option>
                          <option value="형제·자매">형제·자매</option>
                          <option value="기타 가족">기타 가족</option>
                        </select>
                      </Field>

                      <Field>
                        <span>영정사진</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Field>
                    </FormGroup>

                    <FormActions>
                      <span />
                      <NextButton type="button" onClick={handleNext}>
                        다음 단계
                      </NextButton>
                    </FormActions>
                  </ApplicationPane>
                )}

                {/* STEP 02: 장례 일정 */}
                {step === 2 && (
                  <ApplicationPane>
                    <Eyebrow>STEP 02</Eyebrow>
                    <h1>
                      온라인 장례 기간을
                      <br />
                      설정해주세요.
                    </h1>
                    <p>빈소는 종료 시각까지 운영되고 이후 추억관으로 전환됩니다.</p>

                    <FormGroup>
                      <TwoFields>
                        <Field>
                          <span>빈소 시작 일시</span>
                          <input
                            type="datetime-local"
                            name="funeralStartAt"
                            value={formData.funeralStartAt}
                            onChange={handleInputChange}
                          />
                        </Field>
                        <Field>
                          <span>빈소 종료 일시</span>
                          <input
                            type="datetime-local"
                            name="funeralEndAt"
                            value={formData.funeralEndAt}
                            onChange={handleInputChange}
                          />
                        </Field>
                      </TwoFields>

                      <TwoFields>
                        <Field>
                          <span>입관 일시</span>
                          <input
                            type="datetime-local"
                            name="encoffinmentAt"
                            value={formData.encoffinmentAt}
                            onChange={handleInputChange}
                          />
                        </Field>
                        <Field>
                          <span>발인 일시</span>
                          <input
                            type="datetime-local"
                            name="departureAt"
                            value={formData.departureAt}
                            onChange={handleInputChange}
                          />
                        </Field>
                      </TwoFields>

                      <Field>
                        <span>마음 전하실 계좌 · 은행</span>
                        <select
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                        >
                          {BANK_OPTIONS.map((bank) => (
                            <option key={bank.value} value={bank.value}>
                              {bank.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <TwoFields>
                        <Field>
                          <span>계좌번호</span>
                          <input
                            name="accountNumber"
                            placeholder="숫자만 입력"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                          />
                        </Field>
                        <Field>
                          <span>예금주</span>
                          <input
                            name="accountHolder"
                            placeholder="예: 김철수"
                            value={formData.accountHolder}
                            onChange={handleInputChange}
                          />
                        </Field>
                      </TwoFields>
                    </FormGroup>

                    <FormActions>
                      <PrevButton type="button" onClick={handlePrev}>
                        이전
                      </PrevButton>
                      <NextButton type="button" onClick={handleNext}>
                        다음 단계
                      </NextButton>
                    </FormActions>
                  </ApplicationPane>
                )}

                {/* STEP 03: 요금제 선택 */}
                {step === 3 && (
                  <ApplicationPane>
                    <Eyebrow>STEP 03</Eyebrow>
                    <h1>
                      글쓰기 인원과
                      <br />
                      보관기간을 선택해주세요.
                    </h1>
                    <p>열람 인원은 모든 요금제에서 제한하지 않습니다.</p>

                    <ChoiceTitle>글쓰기 인원</ChoiceTitle>
                    <ChoiceGrid>
                      {[
                        { code: 'SMALL', count: '50명' },
                        { code: 'STANDARD', count: '200명' },
                        { code: 'LARGE', count: '500명' },
                      ].map((item) => (
                        <ChoiceLabel
                          key={item.count}
                          $checked={formData.writers === item.count}
                        >
                          <input
                            type="radio"
                            name="writers"
                            value={item.count}
                            checked={formData.writers === item.count}
                            onChange={handleInputChange}
                          />
                          <span>{item.code}</span>
                          <strong>{item.count}</strong>
                        </ChoiceLabel>
                      ))}
                    </ChoiceGrid>

                    <ChoiceTitle>추억관 공개 보관기간</ChoiceTitle>
                    <ChoiceGrid>
                      {[
                        { code: 'BASIC', period: '1년' },
                        { code: 'LONG', period: '5년' },
                        { code: 'ARCHIVE', period: '10년' },
                      ].map((item) => (
                        <ChoiceLabel
                          key={item.period}
                          $checked={formData.retention === item.period}
                        >
                          <input
                            type="radio"
                            name="retention"
                            value={item.period}
                            checked={formData.retention === item.period}
                            onChange={handleInputChange}
                          />
                          <span>{item.code}</span>
                          <strong>{item.period}</strong>
                        </ChoiceLabel>
                      ))}
                    </ChoiceGrid>

                    <PriceBox>
                      <PriceLabel>선택하신 요금제</PriceLabel>
                      <PriceValue>
                        {selectedPrice != null ? formatPrice(selectedPrice) : '-'}
                      </PriceValue>
                    </PriceBox>

                    <FormActions>
                      <PrevButton type="button" onClick={handlePrev}>
                        이전
                      </PrevButton>
                      <NextButton type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? '신청 처리 중...' : '신청'}
                      </NextButton>
                    </FormActions>
                  </ApplicationPane>
                )}
              </ApplyCard>
            </ApplicationShell>
          </FlowBody>
        </FlowPage>
      ) : (
        /* 완료 화면 */
        <FlowPage id="complete">

          <FlowBody>
            <CompleteCard>
              <CompleteMark>✓</CompleteMark>
              <Eyebrow>APPLICATION READY</Eyebrow>
              <CompleteTitle>
                온라인 빈소가
                <br />
                생성되었습니다.
              </CompleteTitle>
              <CompleteDescription>
                아래 초대 링크를 조문객에게 전달해주세요. 결제 관련 화면은 프로토타입입니다.
              </CompleteDescription>

              <SummaryTable>
                <div>
                  <span>고인 성함</span>
                  <strong>{formData.deceasedName || '미입력'}</strong>
                </div>
                <div>
                  <span>글쓰기 인원</span>
                  <strong>{formData.writers}</strong>
                </div>
                <div>
                  <span>공개 보관기간</span>
                  <strong>{formData.retention}</strong>
                </div>
                {createResult && (
                  <div>
                    <span>초대 링크</span>
                    <strong><Link to={`${createResult.inviteUrl}`}>링크가기</Link> <button onClick={async ()=>{
                      await navigator.clipboard.writeText(createResult.inviteUrl);
                    }}>링크복사</button></strong>
                  </div>
                )}
                <div>
                  <span>결제 금액</span>
                  <strong>{selectedPrice != null ? formatPrice(selectedPrice) : '추후 확정'}</strong>
                </div>
              </SummaryTable>

              <PrimaryButton type="button" onClick={() => (onHomeClick ? onHomeClick() : navigate('/'))}>
                홈으로 돌아가기
              </PrimaryButton>
            </CompleteCard>
          </FlowBody>
        </FlowPage>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}

// ==========================================
// 3. Styled Components (하단배치 & 세미콜론 후 줄바꿈)
// ==========================================

const FlowPage = styled.section`
  background-color: #eee9df;
  background-image: radial-gradient(#cbc3b7 0.7px, transparent 0.7px);
  background-size: 6px 6px;
`;

const FlowHeader = styled.header`
  height: 78px;
  padding: 0 6.5vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #c5bbad;
  background: rgba(255, 253, 249, 0.96);
  box-shadow: 0 8px 30px rgba(56, 43, 33, 0.035);

  @media (max-width: 940px) {
    padding-inline: 28px;
  }
`;

const BackButton = styled.button`
  border: 0;
  color: #61584e;
  background: transparent;
  font-size: 11px;
`;

const BrandButton = styled.button`
  display: flex;
  align-items: center;
  gap: 13px;
  border: 0;
  color: var(--ink);
  background: transparent;

  strong {
    font-family: "Batang", serif;
    font-size: 18px;
    letter-spacing: 0.13em;
  }
`;

const BrandMark = styled.span`
  width: auto;
  height: auto;
  border: 0;
  color: #402f24;
  font: 600 21px/1 "Batang", serif;
  letter-spacing: -0.1em;

  &::after {
    content: "";
    display: inline-block;
    width: 1px;
    height: 25px;
    margin-left: 13px;
    vertical-align: middle;
    background: #cfc5b8;
  }
`;

const FlowStep = styled.span`
  color: #7a7065;
  font: 9px monospace;
`;

const FlowBody = styled.div`
  min-height: calc(100vh - 78px);
  display: grid;
  place-items: center;
  padding: 55px;
`;

const ApplicationShell = styled.div`
  width: min(980px, 84vw);
  display: grid;
  grid-template-columns: 245px 1fr;
  border: 1px solid #b6aa9d;
  background: #fffdfa;
  box-shadow: 0 25px 70px rgba(66, 49, 37, 0.13);

  @media (max-width: 940px) {
    width: calc(100vw - 48px);
    grid-template-columns: 210px 1fr;
  }
`;

const ApplySidebar = styled.aside`
  padding: 42px 28px;
  color: #e9e1d6;
  background: linear-gradient(180deg, #46352a, #30251e);

  h2 {
    margin: 0 0 35px;
    font: 400 20px "Batang", serif;
  }
`;

interface SideStepProps {
  $active?: boolean;
}

const SideStep = styled.div<SideStepProps>`
  position: relative;
  padding: 0 0 28px 25px;
  color: ${(props) => (props.$active ? 'white' : '#94877c')};
  font-size: 10px;
  font-weight: ${(props) => (props.$active ? '700' : 'normal')};
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    left: 3px;
    top: 13px;
    width: 7px;
    height: 7px;
    border: 1px solid #a99c90;
    border-radius: 50%;
    background: ${(props) => (props.$active ? '#ded0bf' : 'transparent')};
    box-shadow: ${(props) =>
      props.$active ? '0 0 0 3px rgba(222,208,191,.17)' : 'none'};
  }

  &::after {
    content: "";
    position: absolute;
    left: 7px;
    top: 34px;
    bottom: 4px;
    border-left: 1px solid #69584b;
  }

  &:last-child::after {
    display: none;
  }
`;

const ApplyCard = styled.div`
  width: auto;
  padding: 52px;
  border: 0;
  box-shadow: none;

  @media (max-width: 940px) {
    padding: 40px;
  }
`;

const ApplicationPane = styled.section`
  display: block;

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

const FormGroup = styled.div`
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

  input, select, textarea {
    width: 100%;
    padding: 0 12px;
    border: 1px solid #c3b9ae;
    background: #fff;
    outline: none;

    &:focus {
      border-color: var(--brown);
      box-shadow: 0 0 0 2px #e9ded1;
    }
  }

  input, select {
    height: 44px;
  }

  textarea {
    height: 100px;
    padding-top: 12px;
    resize: none;
  }
`;

const TwoFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const FormActions = styled.div`
  margin-top: 26px;
  display: flex;
  justify-content: space-between;

  button {
    height: 44px;
    padding: 0 18px;
  }
`;

const PrevButton = styled.button`
  border: 1px solid #a69c90;
  background: white;
`;

const NextButton = styled.button`
  border: 1px solid #463226;
  color: white;
  background: #463226;
  font-weight: 700;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: #2f221b;
    transform: translateY(-1px);
  }
`;

const ChoiceTitle = styled.p`
  margin: 23px 0 10px;
  font-size: 10px;
  font-weight: 700;
`;

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

interface ChoiceLabelProps {
  $checked?: boolean;
}

const ChoiceLabel = styled.label<ChoiceLabelProps>`
  position: relative;
  padding: 19px 9px;
  border: ${(props) =>
    props.$checked ? '1px solid #634632' : '1px solid #c7bcb0'};
  box-shadow: ${(props) =>
    props.$checked ? 'inset 0 0 0 1px #634632' : 'none'};
  background: ${(props) => (props.$checked ? '#f2e8dc' : '#fff')};
  color: ${(props) => (props.$checked ? 'var(--brown)' : 'inherit')};
  text-align: center;
  cursor: pointer;
  transition: 0.17s ease;

  &:hover {
    border-color: #8a715d;
    background: ${(props) => (props.$checked ? '#f2e8dc' : '#faf5ee')};
  }

  input {
    position: absolute;
    opacity: 0;
  }

  span {
    display: block;
    color: #776e64;
    font-size: 9px;
  }

  strong {
    display: block;
    margin-top: 5px;
    font: 400 18px "Batang", serif;
  }
`;

const PriceBox = styled.div`
  margin-top: 17px;
  padding: 16px 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #b6aa9d;
  color: #402f24;
  background: #f6f1ea;
`;

const PriceLabel = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: #756a5e;
`;

const PriceValue = styled.strong`
  font: 400 22px "Batang", serif;
  letter-spacing: -0.02em;
`;

const CompleteCard = styled.div`
  width: min(540px, 90%);
  margin: 0 auto;
  padding: 48px;
  border: 1px solid #b6aa9d;
  background: #fffdfa;
  box-shadow: 0 25px 70px rgba(66, 49, 37, 0.13);
  text-align: center;

  @media (max-width: 940px) {
    padding: 36px 24px;
  }
`;

const CompleteMark = styled.div`
  display: inline-grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  border-radius: 50%;
  color: var(--white);
  background: #463226;
  font-size: 20px;
`;

const CompleteTitle = styled.h1`
  margin: 0 0 12px;
  font: 400 28px/1.4 "Batang", serif;
  letter-spacing: -0.03em;
`;

const CompleteDescription = styled.p`
  margin: 0 0 28px;
  color: #756c62;
  font-size: 11px;
  line-height: 1.6;
`;

const SummaryTable = styled.div`
  margin-bottom: 32px;
  border-top: 1px solid #c9c0b2;
  border-bottom: 1px solid #c9c0b2;
  background: #f9f6f0;

  div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px dashed #ded7cb;
    font-size: 11px;

    &:last-child {
      border-bottom: 0;
    }

    a {
      display: block;
      width: 300px;
    }
  }

  span {
    color: #756c62;
  }

  strong {
    color: var(--ink);
    font-weight: 700;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  height: 46px;
  border: 1px solid #463226;
  color: var(--white);
  background: #463226;
  font-weight: 700;
  transition: background 0.18s ease, transform 0.18s ease;

  &:hover {
    background: #2f221b;
    transform: translateY(-1px);
  }
`;