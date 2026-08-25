// 온라인 빈소 생성(POST /api/memorials) 성공 시 서버가 돌려준 빈소 정보를 저장해뒀다가,
// inviteToken/memorialId가 필요한 다른 화면·API에서 다시 꺼내 쓰기 위한 용도.
// localStorage에 저장하므로 브라우저를 새로고침해도 유지됨.

const STORAGE_KEY = "yurok_memorial";

export interface StoredMemorial {
    memorialId: number;
    inviteToken: string;
    inviteUrl: string;
}

export function saveMemorial(memorial: StoredMemorial) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memorial));
}

export function getMemorial(): StoredMemorial | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredMemorial;
    } catch {
        return null;
    }
}
