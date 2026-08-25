import { createContext, useContext, useState, type ReactNode } from "react";

// 로그인 API(POST /api/users/login) 응답으로 받은 유족(유저) 정보.
// 현재 백엔드가 JWT/세션 인증을 안 쓰는 MVP라, 로그인 이후 화면(예: 빈소 신청)에서
// ownerId로 써야 하는 userId를 여기 담아두고 꺼내 씀.
// (원래 Recoil atom으로 만들었는데, Recoil 0.7.7이 React 19와 호환이 안 돼서
// React Context로 교체함.)
// 새로고침하면 초기화됨(로그인 유지가 필요해지면 localStorage 연동 추가 필요).
export interface LoggedInUser {
  userId: number;
  name: string;
}

interface UserContextValue {
  user: LoggedInUser | null;
  setUser: (user: LoggedInUser | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoggedInUser | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser는 UserProvider 안에서만 쓸 수 있음");
  }
  return ctx;
}
