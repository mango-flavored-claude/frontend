import React, { useState, useEffect, useRef } from 'react';
import { createGlobalStyle } from 'styled-components';
import * as S from './OnlineAltar.styled.ts';
import { publicAsset } from '../../utils/publicAsset';
import { useInviteToken } from '../../hooks/useInviteToken.ts';
import { getVisitor, hasWrittenMemory, markMemoryWritten } from '../../utils/visitorStorage';

interface MemorialHome {
  deceasedName: string;
  birthDate: string;
  deathDate: string;
  offeringCount?: number;
  visitorCount?: number;
}

// 추억 목록 조회: GET /api/memorials/{inviteToken}/memories
interface MemoryListItem {
  memoryId: number;
  visitorName: string;
  relationship: string;
  generatedImageUrl: string;
}

// 추억 상세 조회: GET /api/memorials/{inviteToken}/memories/{memoryId}?visitorId=...
interface MemoryDetailResponse {
  memoryId: number;
  visitorName: string;
  relationship: string;
  content: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  photoUrls: string[];
}

// 상세 보기 모달에 실제로 표시할 값(상세 조회 응답을 화면용으로 정리한 것)
interface MemoryItem {
  id: number;
  text: string;
  author: string;
  relation: string;
  imageUrl?: string;
}

const FLOWER_ASSETS = [
  publicAsset('image/chrysanthemum-offering-upright.png'),
  publicAsset('image/chrysanthemum-offering-left.png'),
  publicAsset('image/chrysanthemum-offering-right.png'),
];

const centerOut = (count: number): number[] => {
  const center = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => i).sort(
    (a, b) => Math.abs(a - center) - Math.abs(b - center)
  );
};

// 줄 간격을 좁히고 4번째 줄 추가 (총 54개 위치 생성)
const buildFlowerPositions = (): Array<[number, number, number, number]> => {
  const MAX_FLOWERS = 54;
  const rows = [
    { bottom: 12, count: 15, min: 12, max: 80, scale: 0.8 },   // 1번째 줄 (맨 앞)
    { bottom: 16.5, count: 14, min: 15, max: 77, scale: 0.74 }, // 2번째 줄
    { bottom: 21, count: 13, min: 17, max: 75, scale: 0.68 },   // 3번째 줄
    { bottom: 25.5, count: 12, min: 19, max: 73, scale: 0.62 }, // 4번째 줄 (맨 뒤 추가)
  ];
  const result: Array<[number, number, number, number]> = [];

  rows.forEach((row, rowIndex) => {
    const slots = Array.from(
      { length: row.count },
      (_, i) => row.min + (row.max - row.min) * (i / (row.count - 1))
    );
    centerOut(row.count).forEach((slotIndex, orderIndex) => {
      if (result.length >= MAX_FLOWERS) return;

      const stagger = (rowIndex % 2 ? 1 : -1) * ((orderIndex % 3) - 1) * 0.4;
      const rotation = ((slotIndex % 5) - 2) * 0.75;
      const scale = row.scale + ((slotIndex % 4) - 1.5) * 0.012;
      result.push([slots[slotIndex], row.bottom + stagger, rotation, scale]);
    });
  });

  return result.slice(0, MAX_FLOWERS);
};

const POSITIONS = buildFlowerPositions();

// 스크롤 자체는 그대로 되게 두고, 브라우저 스크롤바만 안 보이게 함.
// 이 컴포넌트가 마운트돼있는 동안만 적용되고, 페이지 떠나면 자동으로 해제됨.
const HideScrollbarStyle = createGlobalStyle`
  html, body {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE, Edge */
  }
  html::-webkit-scrollbar, body::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`;

export default function MemorialPark() {
  const key = useInviteToken();
  const API_BASE = "https://d2qa5spsddshr5.cloudfront.net";

  const [flowers, setFlowers] = useState<
    Array<{
      id: number;
      src: string;
      left: number;
      bottom: number;
      zIndex: number;
      rotation: number;
      scale: number;
      isNew: boolean;
    }>
  >([]);

  const [portraitUrl, setPortraitUrl] = useState('');
  const [memorial, setMemorial] = useState<MemorialHome | null>(null);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [memories, setMemories] = useState<MemoryListItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<MemoryItem | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPageTransition, setShowPageTransition] = useState(false);

  // 국화가 놓인 뒤 5초간 화면 전환이 없으면 다시 어두워지며 이동을 안내함
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  // 추념 공간(추억관)에 처음 도착했을 때 한 번 어두워졌다 밝아지는 연출
  const [showMemoryIntro, setShowMemoryIntro] = useState(false);

  // 추념글 작성 폼 상태
  const [memoryText, setMemoryText] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const altarRef = useRef<HTMLElement>(null);
  const memoryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/memorials/${key}/portrait`);
        const data = await res.json();

        if (!cancelled && res.ok && data.success && data.result?.imageUrl) {
          setPortraitUrl(data.result.imageUrl);
        }
      } catch {
        // 백엔드 통신 실패 시 예외 처리
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, API_BASE]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/memorials/${key}`);
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setMemorial(data.result);
        }
      } catch {
        // 백엔드 통신 실패 시 예외 처리
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [key, API_BASE]);

  // 추억 목록 조회: GET /api/memorials/{inviteToken}/memories
  const fetchMemories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/memorials/${key}/memories`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.result)) {
        setMemories(data.result);
      }
    } catch {
      // 실패해도 추억관 그리드가 비어있게 두면 되니 별도 에러 처리 없음
    }
  };

  useEffect(() => {
    fetchMemories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, API_BASE]);

  // 영정 화면: 국화 생성 애니메이션이 끝난 뒤에도 5초간 화면 전환이 없으면,
  // 다시 어두워지며 추념 공간으로 이동하라는 안내 문구를 띄움
  useEffect(() => {
    const FLOWER_REVEAL_MS = 14100; // 국화 애니메이션 지연(12s) + 재생 시간(2.1s)과 맞춤
    const IDLE_WAIT_MS = 5000;

    const revealTimer = window.setTimeout(() => {
      idleTimerRef.current = window.setTimeout(() => {
        setShowIdlePrompt(true);
      }, IDLE_WAIT_MS);
    }, FLOWER_REVEAL_MS);

    return () => {
      window.clearTimeout(revealTimer);
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, []);

  // 추억 상세 조회: GET /api/memorials/{inviteToken}/memories/{memoryId}?visitorId=...
  // PRIVATE 추억은 작성자 본인만 조회 가능 — 서버가 visitorId로 판단함
  const handleSelectMemory = async (item: MemoryListItem) => {
    if (isDetailLoading) return;

    const visitor = getVisitor();
    if (!visitor) {
      alert('조문객 정보를 찾을 수 없습니다. 방명록을 먼저 작성해주세요.');
      return;
    }

    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const res = await fetch(
        `${API_BASE}/api/memorials/${key}/memories/${item.memoryId}?visitorId=${visitor.visitorId}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setDetailError(data.message || '비공개로 남겨진 추억이라 볼 수 없어요.');
        return;
      }

      const detail: MemoryDetailResponse = data.result;
      setSelectedDetail({
        id: detail.memoryId,
        text: detail.content,
        author: detail.visitorName,
        relation: detail.relationship,
        imageUrl: detail.photoUrls[0] ?? item.generatedImageUrl,
      });
    } catch {
      setDetailError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const createFlowerData = (index: number, isNew: boolean) => {
    const posIndex = index % POSITIONS.length;
    const [left, bottom, rotation, scale] = POSITIONS[posIndex];
    const src = FLOWER_ASSETS[Math.floor(Math.random() * FLOWER_ASSETS.length)];

    const finalRotation = rotation + (Math.random() * 3 - 1.5);
    const finalScale = scale + (Math.random() * 0.035 - 0.0175);

    return {
      id: index,
      src,
      left,
      bottom,
      zIndex: 100 - Math.round(bottom * 2),
      rotation: finalRotation,
      scale: finalScale,
      isNew,
    };
  };

  const renderFlowers = () => {

    const rawCount = Number(memorial?.visitorCount);
    if (!Number.isFinite(rawCount) || rawCount <= 0) {
      setFlowers([]);
      return;
    }

    // 꽃의 개수는 최대 54개로 제한
    const totalFlowers = Math.min(POSITIONS.length, Math.floor(rawCount));

    const flowerList = [];
    // 1 ~ (N-1)번째 꽃: 애니메이션 없음 (isNew = false)
    for (let i = 0; i < totalFlowers - 1; i++) {
      flowerList.push(createFlowerData(i, false));
    }
    // N번째(마지막) 꽃: 애니메이션 실행 (isNew = true)
    flowerList.push(createFlowerData(totalFlowers - 1, true));

    setFlowers(flowerList);
  };

  useEffect(() => {
    renderFlowers();
  }, [memorial]);

  const moveToSection = (targetRef: React.RefObject<HTMLElement | null>) => {
    if (isTransitioning || !targetRef.current) return;

    // 사용자가 화면을 전환했으니, 영정 화면의 "이동 안내" 타이머/오버레이는 취소
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    setShowIdlePrompt(false);

    setIsTransitioning(true);
    setShowPageTransition(true);

    setTimeout(() => {
      window.scrollTo(0, targetRef.current?.offsetTop || 0);
      // 추념 공간에 도착하면 한 번 어두워졌다 밝아지며 안내 문구를 보여줌
      if (targetRef === memoryRef) {
        setShowMemoryIntro(true);
      }
    }, 420);

    setTimeout(() => {
      setShowPageTransition(false);
      setIsTransitioning(false);
    }, 930);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isTransitioning) {
      e.preventDefault();
      return;
    }

    if (e.deltaY > 12 && window.scrollY < window.innerHeight * 0.32) {
      moveToSection(memoryRef);
    } else if (
      e.deltaY < -12 &&
      memoryRef.current &&
      window.scrollY <= memoryRef.current.offsetTop + 3 &&
      window.scrollY > window.innerHeight * 0.55
    ) {
      moveToSection(altarRef);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    // "+" 버튼을 여러 번 눌러 한 장씩 추가해도 기존에 고른 사진이 안 사라지도록,
    // 새로 고른 파일을 기존 목록 뒤에 이어 붙임(최대 3장)
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    e.target.value = ''; // 같은 파일을 다시 선택할 수 있도록 초기화
  };

  // selectedFiles가 바뀔 때마다 미리보기용 objectURL을 새로 만들고, 이전 것은 정리함
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setSelectedPhotoIndex(0);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  // 추억 작성 팝업을 열기 전에 확인: 조문객 정보가 있어야 하고, 1인 1회 제한도 넘으면 안 됨
  const handleOpenComposer = () => {
    const visitor = getVisitor();
    if (!visitor) {
      alert('조문객 정보를 찾을 수 없습니다. 방명록을 먼저 작성해주세요.');
      return;
    }
    if (hasWrittenMemory(visitor.visitorId)) {
      alert('추억은 한 분당 한 번만 남기실 수 있어요. 이미 소중한 기억을 남겨주셨습니다.');
      return;
    }
    setIsComposerOpen(true);
  };

  const handleSubmitMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText.trim() || isSubmitting) return;

    const visitor = getVisitor();
    if (!visitor) {
      alert('조문객 정보를 찾을 수 없습니다. 방명록을 먼저 작성해주세요.');
      return;
    }
    if (hasWrittenMemory(visitor.visitorId)) {
      alert('추억은 한 분당 한 번만 남기실 수 있어요. 이미 소중한 기억을 남겨주셨습니다.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      let photoIndexValue: number | null = null;
      if (selectedFiles.length > 0) {
        photoIndexValue = (selectedPhotoIndex ?? 0) + 1;
      }

      const requestDto = {
        visitorId: visitor.visitorId,
        content: memoryText,
        visibility,
        selectedPhotoIndex: photoIndexValue,
      };

      formData.append(
        'request',
        new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
      );

      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const res = await fetch(`${API_BASE}/api/memorials/${key}/memories`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        markMemoryWritten(visitor.visitorId);
        setMemoryText('');
        setVisibility('PUBLIC');
        setSelectedFiles([]); // previewUrls/selectedPhotoIndex는 selectedFiles effect가 알아서 초기화함
        setIsComposerOpen(false);
        // 추념하기 후 목록 화면으로 돌아왔을 때 방금 남긴 추념글이 보이도록 목록을 새로고침
        fetchMemories();
      } else {
        alert(data.message || '추념글 등록에 실패했습니다.');
      }
    } catch {
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deceasedName = memorial?.deceasedName || '';
  const lifeDates =
    memorial?.birthDate && memorial?.deathDate
      ? `${memorial.birthDate} — ${memorial.deathDate}`
      : '';

  return (
    <S.Container $isPageTransitioning={isTransitioning} onWheel={handleWheel}>
      <HideScrollbarStyle />
      <S.AltarSection ref={altarRef}>
        <S.SceneStage>
          <S.AltarArtboard>
            <S.RoomTitle>
              <strong>故 {deceasedName}님의 온라인 빈소</strong>
              <S.LifeDates>{lifeDates}</S.LifeDates>
            </S.RoomTitle>

            {portraitUrl && (
              <S.PortraitFrame>
                <S.PortraitImage src={portraitUrl} alt={`故 ${deceasedName}님 영정사진`} />
              </S.PortraitFrame>
            )}

            <S.FlowerLayer>
              {flowers.map((f) => (
                <S.OfferingFlower
                  key={f.id}
                  src={f.src}
                  alt=""
                  $isNew={f.isNew}
                  $left={f.left}
                  $bottom={f.bottom}
                  $zIndex={f.zIndex}
                  $rotation={f.rotation}
                  $scale={f.scale}
                />
              ))}
            </S.FlowerLayer>
            <S.NameplateName aria-label="고인 명패">
              <span>故{deceasedName}</span>
            </S.NameplateName>
          </S.AltarArtboard>
          <S.EntranceDimmer aria-hidden="true" />
          <S.FuneralGuidance
            role="status"
            aria-label={`빈소 안내. 이곳은 고 ${deceasedName}님의 온라인 빈소입니다. 잠시 마음을 가다듬으시고, 고인의 평안한 안식을 기원해 주시기 바랍니다. 마음과 함께 국화가 놓였습니다.`}
          >
            <p className="guidance-line" aria-hidden="true">
              이곳은 故 {deceasedName}님의 온라인 빈소입니다.
            </p>
            <p className="guidance-line" aria-hidden="true">
              잠시 마음을 가다듬으시고,
            </p>
            <p className="guidance-line" aria-hidden="true">
              고인의 평안한 안식을 기원해 주시기 바랍니다.
            </p>
            <p className="guidance-line" aria-hidden="true">
              마음과 함께 국화가 놓였습니다.
            </p>
          </S.FuneralGuidance>
          {showIdlePrompt && (
            <>
              <S.IdlePromptDimmer aria-hidden="true" />
              <S.IdlePromptText role="status">
                고인과 마지막 인사를 모두 나누셨다면,
                <br />
                아래의 추념 공간으로 이동해주세요.
              </S.IdlePromptText>
            </>
          )}
        </S.SceneStage>
        <S.ScrollButton onClick={() => moveToSection(memoryRef)}>
          <strong>고인과의 추억 이어보기</strong>
          <i>↓</i>
        </S.ScrollButton>
      </S.AltarSection>

      <S.MemorySection ref={memoryRef}>
        {showMemoryIntro && (
          <S.MemoryIntroOverlay
            $isRun
            role="status"
            aria-label="이곳은 추념 공간이므로, 추념 메시지를 남겨주세요."
            onAnimationEnd={() => setShowMemoryIntro(false)}
          >
            <p aria-hidden="true">
              이곳은 추념 공간이므로,
              <br />
              추념 메시지를 남겨주세요.
            </p>
          </S.MemoryIntroOverlay>
        )}
        <S.MemoryHeading>
          <S.MemoryTitleWrap>
            <S.MemoryMark>記</S.MemoryMark>
            <div>
              <p className="eyebrow">유록 · 추억관</p>
              <h2>
                故 {deceasedName}님과
                <br />
                함께한 기억
              </h2>
            </div>
          </S.MemoryTitleWrap>
          <aside>
            <S.MemorySummary>
              <b>{memories.length}개의 기억</b>
              <p>
                조문객들이 남긴 마음이
                <br />한 장씩 이곳에 이어집니다.
              </p>
            </S.MemorySummary>
            <button onClick={handleOpenComposer}>+ 추념하기</button>
          </aside>
        </S.MemoryHeading>

        <S.Garden>
          {memories.map((item) => (
            <S.MemoryCard key={item.memoryId} onClick={() => handleSelectMemory(item)}>
              <S.MemoryPlaceholder>
                {item.generatedImageUrl && (
                  <img
                    src={item.generatedImageUrl}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      // 딱 잘린 원형/사각 테두리 대신, 가장자리가 넓게 부드럽게 사라지는 수채화 느낌으로
                      WebkitMaskImage:
                        'radial-gradient(circle, black 25%, transparent 70%)',
                      maskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
                    }}
                  />
                )}
                <span className="memory-index">
                  기억 {String(item.memoryId).padStart(2, '0')}
                </span>
                <i className="placeholder-symbol" />
                <p>
                  기억으로 만든 사진이
                  <br />
                  이곳에 기록됩니다.
                </p>
              </S.MemoryPlaceholder>
              <S.MemoryCopy>
                <S.MemoryAuthor>
                  <small>작성자</small>
                  <strong>
                    {item.visitorName} <em>{item.relationship}</em>
                  </strong>
                </S.MemoryAuthor>
                <S.MemoryOpen>
                  추념문 보기 <i>→</i>
                </S.MemoryOpen>
              </S.MemoryCopy>
            </S.MemoryCard>
          ))}
        </S.Garden>

        <S.GardenEnd>
          <img src={publicAsset('image/chrysanthemum-offering-front.png')} alt="국화" />
          <p>
            남겨진 기억만큼
            <br />
            추억관은 아래로 이어집니다.
          </p>
        </S.GardenEnd>
      </S.MemorySection>

      {/* 작성 모달 */}
      <S.Modal $isOpen={isComposerOpen}>
        <S.MemoryComposer onSubmit={handleSubmitMemory}>
          <S.ModalClose type="button" onClick={() => setIsComposerOpen(false)}>
            ×
          </S.ModalClose>
          <p className="eyebrow">추념하기</p>
          <h3>
            기억하고 싶은 순간을
            <br />
            남겨주세요.
          </h3>
          <textarea
            value={memoryText}
            onChange={(e) => setMemoryText(e.target.value)}
            placeholder="고인과 함께한 기억을 적어주세요."
            required
          />
          <S.PhotoRow>
            {[0, 1, 2].map((idx) => {
              const hasPhoto = Boolean(previewUrls[idx]);
              return (
                <S.PhotoChoice
                  key={idx}
                  type="button"
                  $isSelected={selectedPhotoIndex === idx && hasPhoto}
                  $bgImage={previewUrls[idx]}
                  onClick={() => {
                    if (hasPhoto) setSelectedPhotoIndex(idx);
                  }}
                  disabled={!hasPhoto}
                >
                  <span>{hasPhoto ? `사진 ${idx + 1}` : ''}</span>
                </S.PhotoChoice>
              );
            })}
            <S.PhotoAdd>
              <span>
                <b>＋</b>사진
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
              />
            </S.PhotoAdd>
          </S.PhotoRow>
          <S.AiPhotoGuide>
            테두리로 표시된 사진을 중심으로 추모 이미지를 만듭니다.
          </S.AiPhotoGuide>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#65594f',
              margin: '4px 0 8px',
            }}
          >
            <input
              type="checkbox"
              checked={visibility === 'PRIVATE'}
              onChange={(e) => setVisibility(e.target.checked ? 'PRIVATE' : 'PUBLIC')}
            />
            나만 보기
          </label>
          <S.SubmitMemory type="submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '추념하기'}
          </S.SubmitMemory>
        </S.MemoryComposer>
      </S.Modal>

      {/* 상세 보기 모달 */}
      <S.Modal $isOpen={!!(selectedDetail || detailError)}>
        <S.ModalCard>
          <S.ModalClose
            type="button"
            onClick={() => {
              setSelectedDetail(null);
              setDetailError(null);
            }}
          >
            ×
          </S.ModalClose>
          <p className="eyebrow">추념 기록</p>
          {detailError ? (
            <S.DetailText>{detailError}</S.DetailText>
          ) : (
            <>
              {selectedDetail?.imageUrl && (
                <img
                  src={selectedDetail.imageUrl}
                  alt={`${selectedDetail.author}님이 남긴 사진`}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    display: 'block',
                    marginBottom: 20,
                    // 딱 잘린 사각 테두리 대신, 가장자리가 넓게 부드럽게 사라지는 수채화 느낌으로
                    WebkitMaskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
                    maskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
                  }}
                />
              )}
              <S.DetailText>{selectedDetail?.text}</S.DetailText>
              <S.DetailAuthor>
                {selectedDetail?.author} · {selectedDetail?.relation}
              </S.DetailAuthor>
            </>
          )}
        </S.ModalCard>
      </S.Modal>

      <S.PageTransition $isRun={showPageTransition} aria-hidden="true" />
    </S.Container>
  );
}