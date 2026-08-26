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

// 추억 작성(POST .../memories)은 조문객 1명당 1번만 가능한 API라,
// 한 번 남긴 뒤엔 버튼을 다시 눌러도 API를 또 부르지 않고 프론트에서 바로 막기 위한 플래그.
// 같은 브라우저로 여러 조문객(visitorId)이 번갈아 방명록을 쓸 수 있으므로,
// 불리언 하나가 아니라 "이미 작성한 visitorId 목록"으로 관리함.
const MEMORY_WRITTEN_KEY = "yurok_memory_written_visitor_ids";

function getWrittenVisitorIds(): Set<number> {
    const raw = localStorage.getItem(MEMORY_WRITTEN_KEY);
    if (!raw) return new Set();

    try {
        return new Set(JSON.parse(raw) as number[]);
    } catch {
        return new Set();
    }
}

export function markMemoryWritten(visitorId: number) {
    const ids = getWrittenVisitorIds();
    ids.add(visitorId);
    localStorage.setItem(MEMORY_WRITTEN_KEY, JSON.stringify(Array.from(ids)));
}

export function hasWrittenMemory(visitorId: number): boolean {
    return getWrittenVisitorIds().has(visitorId);
}
