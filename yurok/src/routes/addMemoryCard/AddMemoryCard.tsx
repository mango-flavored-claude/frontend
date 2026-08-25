import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const TRANSITION_MS = 250; // 팝업이 뜨고 닫힐 때의 애니메이션 시간

// TODO: 서버 연동 전이라 사진/글/나만 보기 여부(isPrivate)는 실제로 저장되지 않음.
// 나중에 실제 등록 API가 생기면 여기서 실제로 업로드 요청을 보내고,
// 성공했을 때만 onSubmit을 호출하도록 바꿔야 함.
//
// 페이지 이동 대신 팝업(모달)으로 뜸: 뒤에는 추억모음 화면이 어둡게 깔리고, 가운데에 카드만 보임.
export default function AddMemoryCard({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // "나만 보기" 체크 여부
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 마운트되자마자 true로 바꿔야 transition이 애니메이션으로 재생됨
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 미리보기로 만든 objectURL은 다 쓰고 나면 메모리에서 정리해줘야 함
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // 바로 닫지 않고, 사라지는 애니메이션이 끝난 뒤에 실제로 닫음(부모에게 알림)
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, TRANSITION_MS);
  };

  // "남기기" 버튼: 닫히는 것까지는 같지만, 닫힌 뒤 감사 토스트를 띄워달라고 부모에게 알림
  const handleSubmit = () => {
    setIsVisible(false);
    setTimeout(onSubmit, TRANSITION_MS);
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  // 사진은 선택 사항이라 안 넣어도 되지만, 글은 꼭 있어야 "남기기"가 활성화됨
  const canSubmit = message.trim().length > 0;

  // document.body로 바로 렌더링(Portal)해야, 이 컴포넌트를 감싸는 화면(NextPage의 Wrapper 등)에
  // transform이 걸려있어도 영향받지 않고 항상 "현재 보이는 화면" 기준으로 정확히 뜸
  return createPortal(
    <Overlay $isVisible={isVisible} onClick={handleClose}>
      <Card $isVisible={isVisible} onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose} aria-label="닫기">
          ×
        </CloseButton>

        <Title>추념의 마음을 남겨주세요</Title>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePhotoChange}
        />
        <PhotoUploadBox
          type="button"
          $hasPhoto={!!photoPreview}
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <PhotoPreview src={photoPreview} alt="첨부한 사진 미리보기" />
          ) : (
            <>
              <PhotoUploadIcon>+</PhotoUploadIcon>
              <span>사진 첨부하기</span>
            </>
          )}
        </PhotoUploadBox>

        <MessageInput
          placeholder="고인과 함께했던 순간을 자유롭게 적어주세요.(예: 선생님과 설악산에 갔던 기억, 진달래꽃 등)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <PrivacyRow>
          <input
            id="memory-private"
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <label htmlFor="memory-private">나만 보기</label>
        </PrivacyRow>

        <ButtonGroup>
          <SubmitButton onClick={handleSubmit} disabled={!canSubmit}>
            남기기
          </SubmitButton>
        </ButtonGroup>
      </Card>
    </Overlay>,
    document.body
  );
}

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;

  /* 뒤에 깔린 추억모음 화면이 어둡게 보이도록 */
  background: rgba(0, 0, 0, 0.45);
  transition: opacity ${TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
`;

const Card = styled.div<{ $isVisible: boolean }>`
  position: relative;
  width: 100%;
  max-width: 440px;
  /* 스크롤 없이 내용이 한 화면에 다 보이도록 크기를 작게 유지함(아래 각 요소 크기도 함께 줄임) */
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  padding: 36px 32px 28px;
  text-align: center;
  box-sizing: border-box;

  /* 살짝 작았다가 커지면서 통통 뜨는 느낌 */
  transition: opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: scale(${({ $isVisible }) => ($isVisible ? 1 : 0.94)});
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #828282;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: #f4f2ec;
    color: #1a1a1a;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  font-family: inherit;
  color: #1a1a1a;
  margin: 0 0 18px;
  letter-spacing: -0.02em;
`;

const PhotoUploadBox = styled.button<{ $hasPhoto: boolean }>`
  width: 100%;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 0 16px;
  background: #f7f6f2;
  border: 1.5px dashed #d8cbb2;
  border-radius: 14px;
  color: #a9834f;
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #f2ede2;
    border-color: #c9a063;
  }

  ${({ $hasPhoto }) => $hasPhoto && `border-style: solid; padding: 0;`}
`;

const PhotoUploadIcon = styled.span`
  font-size: 22px;
  line-height: 1;
`;

const PhotoPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const MessageInput = styled.textarea`
  width: 100%;
  height: 90px;
  box-sizing: border-box;
  padding: 12px 14px;
  margin: 0 0 20px;
  font-size: 13.5px;
  font-family: inherit;
  line-height: 1.55;
  color: #1a1a1a;
  background: #f7f6f2;
  border: 1px solid #ece9e1;
  border-radius: 12px;
  outline: none;
  resize: none; /* 사용자가 늘려서 화면을 넘기지 않도록(스크롤 없이 다 보이게) */
  text-align: left;

  &::placeholder {
    color: #b5b0a5;
  }

  &:focus {
    border-color: #c9a063;
  }
`;

const PrivacyRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #a9834f;
    cursor: pointer;
  }

  label {
    font-size: 13px;
    color: #666666;
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const SubmitButton = styled.button`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #a9834f;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 14px 24px;
  font-size: 14.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: #96733f;
  }

  &:disabled {
    background: #d8cbb2;
    cursor: not-allowed;
  }
`;
