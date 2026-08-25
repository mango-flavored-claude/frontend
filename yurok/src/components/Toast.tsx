import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const VISIBLE_MS = 2500; // 토스트가 화면에 떠 있는 시간
const TRANSITION_MS = 300; // 뜨고 사라질 때의 애니메이션 시간

export type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
}

// 화면 위쪽 가운데에 잠깐 떴다가 스스로 사라지는 토스트. API 응답 성공/실패 안내 등에 씀.
export default function Toast({ message, variant = "success", onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showId = requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = setTimeout(() => setIsVisible(false), VISIBLE_MS);
    const removeTimer = setTimeout(onDismiss, VISIBLE_MS + TRANSITION_MS);

    return () => {
      cancelAnimationFrame(showId);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, [onDismiss]);

  // document.body로 바로 렌더링해야 부모 화면의 레이아웃/스크롤과 무관하게 항상 맨 위에 뜸
  return createPortal(
    <ToastBox $isVisible={isVisible} $variant={variant} role="status">
      {message}
    </ToastBox>,
    document.body
  );
}

const ToastBox = styled.div<{ $isVisible: boolean; $variant: ToastVariant }>`
  position: fixed;
  top: 24px;
  left: 50%;
  z-index: 999;
  max-width: min(90vw, 420px);
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  color: #ffffff;
  text-align: center;
  white-space: pre-line;
  background: ${({ $variant }) => ($variant === "success" ? "#2f6b3f" : "#a53d3d")};
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
  transition: opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: translateX(-50%) translateY(${({ $isVisible }) => ($isVisible ? "0" : "-12px")});
`;
