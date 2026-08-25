import React, { useState, useEffect, useRef } from 'react';
import * as S from './OnlineAltar.styled.ts';
import { publicAsset } from '../../utils/publicAsset';
import { useInviteToken } from '../../hooks/useInviteToken.ts';

interface MemorialHome {
  deceasedName: string;
  birthDate: string;
  deathDate: string;
  offeringCount?: number;
}

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

const buildFlowerPositions = (): Array<[number, number, number, number]> => {
  const rows = [
    { bottom: 13.5, count: 17, min: 11, max: 80, scale: 0.8 },
    { bottom: 17.5, count: 15, min: 14, max: 78, scale: 0.77 },
    { bottom: 21.5, count: 13, min: 18, max: 75, scale: 0.73 },
    { bottom: 25.5, count: 11, min: 23, max: 71, scale: 0.69 },
    { bottom: 29.5, count: 9, min: 28, max: 67, scale: 0.65 },
    { bottom: 33.5, count: 8, min: 33, max: 63, scale: 0.61 },
  ];
  const result: Array<[number, number, number, number]> = [];

  rows.forEach((row, rowIndex) => {
    const slots = Array.from(
      { length: row.count },
      (_, i) => row.min + (row.max - row.min) * (i / (row.count - 1))
    );
    centerOut(row.count).forEach((slotIndex, orderIndex) => {
      const stagger = (rowIndex % 2 ? 1 : -1) * ((orderIndex % 3) - 1) * 0.45;
      const rotation = ((slotIndex % 5) - 2) * 0.75;
      const scale = row.scale + ((slotIndex % 4) - 1.5) * 0.012;
      result.push([slots[slotIndex], row.bottom + stagger, rotation, scale]);
    });
  });

  return result;
};

const POSITIONS = buildFlowerPositions();

export default function MemorialPark() {
  const key = useInviteToken();
  const API_BASE = import.meta.env.VITE_API_URL;

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
  const [selectedDetail, setSelectedDetail] = useState<MemoryItem | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPageTransition, setShowPageTransition] = useState(false);

  // 추념글 작성 폼 상태
  const [memoryText, setMemoryText] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0); // 0-based indexing (0 ~ 2)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flowerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const createFlowerData = (index: number, isNew: boolean) => {
    const [left, bottom, rotation, scale] = POSITIONS[index % POSITIONS.length];
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
    if (flowerTimerRef.current) clearTimeout(flowerTimerRef.current);

    const requestedCount = Number(memorial?.offeringCount);
    const totalFlowers = Math.max(
      1,
      Math.min(
        POSITIONS.length,
        Number.isFinite(requestedCount) && requestedCount > 0 ? Math.floor(requestedCount) : 36
      )
    );

    const initialList = [];
    for (let i = 0; i < totalFlowers - 1; i++) {
      initialList.push(createFlowerData(i, false));
    }
    setFlowers(initialList);

    flowerTimerRef.current = setTimeout(() => {
      setFlowers((prev) => [...prev, createFlowerData(totalFlowers - 1, true)]);
    }, 9200);
  };

  useEffect(() => {
    renderFlowers();

    return () => {
      if (flowerTimerRef.current) clearTimeout(flowerTimerRef.current);
    };
  }, [memorial]);

  const moveToSection = (targetRef: React.RefObject<HTMLElement | null>) => {
    if (isTransitioning || !targetRef.current) return;
    setIsTransitioning(true);
    setShowPageTransition(true);

    setTimeout(() => {
      window.scrollTo(0, targetRef.current?.offsetTop || 0);
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

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const files = Array.from(e.target.files).slice(0, 3);
    const newUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedFiles(files);
    setPreviewUrls(newUrls);
    setSelectedPhotoIndex(0); // 파일이 새로 등록되면 기본 1번 사진(인덱스 0) 선택
  };

  const handleSubmitMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // 사진 유무 및 선택된 사진 인덱스 처리 (1-based API 스펙 대응)
      let photoIndexValue: number | null = null;
      if (selectedFiles.length > 0) {
        photoIndexValue = (selectedPhotoIndex ?? 0) + 1;
      }

      // 1. JSON Request 객체 세팅
      const requestDto = {
        visitorId: 1, // 필요 시 동적 ID 값 전달
        content: memoryText,
        visibility,
        selectedPhotoIndex: photoIndexValue,
      };

      formData.append(
        'request',
        new Blob([JSON.stringify(requestDto)], { type: 'application/json' })
      );

      // 2. Photos 파일 객체들 추가
      selectedFiles.forEach((file) => {
        formData.append('photos', file);
      });

      const res = await fetch(`${API_BASE}/api/memorials/${key}/memories`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        // 성공 시 폼 초기화 및 모달 닫기
        setMemoryText('');
        setSelectedFiles([]);
        setPreviewUrls([]);
        setSelectedPhotoIndex(0);
        setIsComposerOpen(false);
      } else {
        alert('추념글 등록에 실패했습니다.');
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
            aria-label={`빈소 안내. 이곳은 고 ${deceasedName}님의 온라인 빈소입니다. 잠시 마음을 가다듬으시고, 고인의 평안한 안식을 기원해 주시기 바랍니다.`}
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
          </S.FuneralGuidance>
          <S.CompleteToast>마음과 함께 국화가 놓였습니다.</S.CompleteToast>
        </S.SceneStage>
        <S.ScrollButton onClick={() => moveToSection(memoryRef)}>
          <strong>고인과의 추억 이어보기</strong>
          <i>↓</i>
        </S.ScrollButton>
      </S.AltarSection>

      <S.MemorySection ref={memoryRef}>
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
              <p>
                조문객들이 남긴 마음이
                <br />한 장씩 이곳에 이어집니다.
              </p>
            </S.MemorySummary>
            <button onClick={() => setIsComposerOpen(true)}>+ 추념하기</button>
          </aside>
        </S.MemoryHeading>

        <S.Garden></S.Garden>

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
                  <span>{hasPhoto ? `사진 ${idx + 1}` : '빈 공간'}</span>
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
          <S.SubmitMemory type="submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '추념하기'}
          </S.SubmitMemory>
        </S.MemoryComposer>
      </S.Modal>

      {/* 상세 보기 모달 */}
      <S.Modal $isOpen={!!selectedDetail}>
        <S.ModalCard>
          <S.ModalClose type="button" onClick={() => setSelectedDetail(null)}>
            ×
          </S.ModalClose>
          <p className="eyebrow">추념 기록</p>
          <S.DetailText>{selectedDetail?.text}</S.DetailText>
          <S.DetailAuthor>
            {selectedDetail?.author} · {selectedDetail?.relation}
          </S.DetailAuthor>
        </S.ModalCard>
      </S.Modal>

      <S.PageTransition $isRun={showPageTransition} aria-hidden="true" />
    </S.Container>
  );
}