import { useParams } from "react-router-dom";

// 개발 중 실제 초대 링크(inviteToken) 없이도 화면을 바로 확인할 수 있도록,
// .env의 더미 값을 fallback으로 씀. (.env에 VITE_DUMMY_INVITE_TOKEN 없으면 undefined)
const DUMMY_INVITE_TOKEN = import.meta.env.VITE_DUMMY_INVITE_TOKEN as string | undefined;

// URL에 실제 key(예: /altar/abc123)가 있으면 그걸 우선 쓰고,
// 없으면(예: 그냥 /altar) 더미 토큰으로 대체함.
export function useInviteToken(): string | undefined {
  const { key } = useParams<{ key: string }>();
  return key ?? DUMMY_INVITE_TOKEN;
}
