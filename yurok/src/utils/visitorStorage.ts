// 방명록 작성/재입장 성공 시 서버가 돌려준 조문객 정보를 저장해뒀다가,
// "추억 작성" API(visitorId가 꼭 필요함) 등에서 다시 꺼내 쓰기 위한 용도.
// localStorage에 저장하므로 브라우저를 새로고침해도 유지됨.

const STORAGE_KEY = "yurok_visitor";

export interface StoredVisitor {
    visitorId: number;
    name: string;
    relationship: string;
    phone: string;
}

export function saveVisitor(visitor: StoredVisitor) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visitor));
}

export function getVisitor(): StoredVisitor | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as StoredVisitor;
    } catch {
        return null;
    }
}
