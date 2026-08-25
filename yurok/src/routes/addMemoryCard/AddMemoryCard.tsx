import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { getVisitor } from "../../utils/visitorStorage";

const TRANSITION_MS = 250; // 팝업이 뜨고 닫힐 때의 애니메이션 시간
const MAX_PHOTOS = 3; // 서버 API 제한(최대 3장)

// 추억 작성 API: POST /api/memorials/{inviteToken}/memories (multipart/form-data)
const API_BASE = import.meta.env.VITE_API_URL;

// 페이지 이동 대신 팝업(모달)으로 뜸: 뒤에는 추억모음 화면이 어둡게 깔리고, 가운데에 카드만 보임.
export default function AddMemoryCard({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { key } = useParams<{ key: string }>();
  const [isVisible, setIsVisible] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false); // "나만 보기" 체크 여부
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 마운트되자마자 true로 바꿔야 transition이 애니메이션으로 재생됨
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 사진이 바뀔 때마다 미리보기용 objectURL을 새로 만들고, 이전 것은 정리함
  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  // 바로 닫지 않고, 사라지는 애니메이션이 끝난 뒤에 실제로 닫음(부모에게 알림)
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, TRANSITION_MS);
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setPhotos((prev) => [...prev, ...files].slice(0, MAX_PHOTOS));
    e.target.value = ""; // 같은 파일을 다시 선택할 수 있도록 초기화
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // 사진은 선택 사항이라 안 넣어도 되지만, 글은 꼭 있어야 "남기기"가 활성화됨
  const canSubmit = message.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const visitor = getVisitor();
    if (!visitor) {
      // 정상적인 흐름(방명록 작성/재입장)을 거치면 항상 있어야 하는 값이라, 방어적으로만 처리
      setError("조문객 정보를 찾을 수 없습니다. 방명록을 먼저 작성해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append(
        "request",
        new Blob(
          [
            JSON.stringify({
              visitorId: visitor.visitorId,
              content: message,
              visibility: isPrivate ? "PRIVATE" : "PUBLIC",
            }),
          ],
          { type: "application/json" }
        )
      );
      photos.forEach((file) => formData.append("photos", file));

      const res = await fetch(`${API_BASE}/api/memorials/${key}/memories`, {
        method: "POST",
        body: formData, // multipart라 Content-Type은 직접 안 정함(브라우저가 자동으로 boundary 포함해서 설정)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "추념 등록에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      // "남기기" 성공: 닫히는 애니메이션 후 부모에게 알림(부모가 감사 토스트를 띄움)
      setIsVisible(false);
      setTimeout(onSubmit, TRANSITION_MS);
    } catch {
      setError("서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          multiple
          hidden
          onChange={handlePhotoChange}
        />
        <PhotoRow>
          {previews.map((src, i) => (
            <PhotoSlot key={src}>
              <PhotoThumb src={src} alt={`첨부한 사진 ${i + 1}`} />
              <RemovePhotoButton
                type="button"
                onClick={() => handleRemovePhoto(i)}
                aria-label="사진 삭제"
              >
                ×
              </RemovePhotoButton>
            </PhotoSlot>
          ))}
          {photos.length < MAX_PHOTOS && (
            <AddPhotoSlot type="button" onClick={() => fileInputRef.current?.click()}>
              <PhotoUploadIcon>+</PhotoUploadIcon>
              <span>사진 추가</span>
            </AddPhotoSlot>
          )}
        </PhotoRow>

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

        {error && <ErrorText>{error}</ErrorText>}

        <ButtonGroup>
          <SubmitButton onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? "등록 중..." : "남기기"}
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

const PhotoRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 0 0 16px;
`;

const slotStyle = `
  width: 96px;
  height: 96px;
  border-radius: 14px;
  overflow: hidden;
`;

const PhotoSlot = styled.div`
  ${slotStyle}
  position: relative;
  flex: 0 0 auto;
`;

const PhotoThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const RemovePhotoButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
`;

const AddPhotoSlot = styled.button`
  ${slotStyle}
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #f7f6f2;
  border: 1.5px dashed #d8cbb2;
  color: #a9834f;
  font-size: 11.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: #f2ede2;
    border-color: #c9a063;
  }
`;

const PhotoUploadIcon = styled.span`
  font-size: 20px;
  line-height: 1;
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
  margin: 0 0 16px;

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

const ErrorText = styled.p`
  font-size: 13px;
  color: #c0392b;
  margin: 0 0 16px;
  text-align: center;
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
