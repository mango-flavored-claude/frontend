import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../store/UserContext";

// 로그인이 필요한 화면(예: 온라인 빈소 신청)을 감싸는 라우트 가드.
// 로그인 안 한 상태로 들어오면 화면 자체를 렌더링하지 않고 로그인 화면으로 돌려보냄.
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" state={{ showNotice: true }} replace />;
  }

  return <>{children}</>;
}
