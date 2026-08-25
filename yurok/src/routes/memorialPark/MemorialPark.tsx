import React, { useState, useEffect, useRef } from 'react';
import * as S from './OnlineAltar.styled.ts';

interface MemorialData {
  deceasedName?: string;
  birthDate?: string;
  deathDate?: string;
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
  './image/chrysanthemum-offering-upright.png',
  './image/chrysanthemum-offering-left.png',
  './image/chrysanthemum-offering-right.png',
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

export const MemorialPark: React.FC<{ initialData?: MemorialData }> = ({ initialData }) => {
  const [deceasedName, setDeceasedName] = useState('김유록');
  const [lifeDates, setLifeDates] = useState('1956. 04. 18 — 2026. 08. 24');
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

  const [memories, setMemories] = useState<MemoryItem[]>([
    {
      id: 1,
      text: '봄이면 함께 걷던 길과 환하게 웃으시던 모습을 오래 기억하겠습니다.',
      author: '김하늘',
      relation: '친구',
    },
    {
      id: 2,
      text: '언제나 먼저 건네주시던 다정한 인사를 잊지 않겠습니다.',
      author: '이준호',
      relation: '직장 동료',
    },
  ]);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<MemoryItem | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPageTransition, setShowPageTransition] = useState(false);

  const [memoryText, setMemoryText] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const flowerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const altarRef = useRef<HTMLElement>(null);
  const memoryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const queryParams = new URLSearchParams(window.location.search);
    const rawName = initialData?.deceasedName || queryParams.get('name') || '김유록';
    setDeceasedName(rawName.replace(/^故\s*/, ''));

    const birth = initialData?.birthDate || queryParams.get('birth') || '1956. 04. 18';
    const death = initialData?.deathDate || queryParams.get('death') || '2026. 08. 24';
    setLifeDates(`${birth} — ${death}`);

    renderFlowers();

    return () => {
      if (flowerTimerRef.current) clearTimeout(flowerTimerRef.current);
    };
  }, [initialData]);

  const renderFlowers = () => {
    if (flowerTimerRef.current) clearTimeout(flowerTimerRef.current);

    const requestedCount = Number(initialData?.offeringCount);
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

  const moveToSection = (targetRef: React.RefObject<HTMLElement>) => {
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
    if (!e.target.files) return;
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const files = Array.from(e.target.files).slice(0, 3);
    const newUrls = files.map((file) => URL.createObjectURL(file));

    setPreviewUrls(newUrls);
    setSelectedPhotoIndex(0);
  };

  const handleSubmitMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText.trim()) return;

    const newMemory: MemoryItem = {
      id: memories.length + 1,
      text: memoryText.trim(),
      author: '테스트 조문객',
      relation: '친구',
    };

    setMemories((prev) => [...prev, newMemory]);
    setIsComposerOpen(false);
    setMemoryText('');
  };

  return (
    <S.Container $isPageTransitioning={isTransitioning} onWheel={handleWheel}>
      <S.AltarSection ref={altarRef}>
        <S.SceneStage>
          <S.AltarArtboard>
            <S.RoomTitle>
              <strong>故 {deceasedName}님의 온라인 빈소</strong>
              <S.LifeDates>{lifeDates}</S.LifeDates>
            </S.RoomTitle>
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
              <b>{memories.length}개의 기억</b>
              <p>
                조문객들이 남긴 마음이
                <br />한 장씩 이곳에 이어집니다.
              </p>
            </S.MemorySummary>
            <button onClick={() => setIsComposerOpen(true)}>+ 추념하기</button>
          </aside>
        </S.MemoryHeading>

        <S.Garden>
          {memories.map((item) => (
            <S.MemoryCard key={item.id} onClick={() => setSelectedDetail(item)}>
              <S.MemoryPlaceholder>
                <span className="memory-index">
                  기억 {String(item.id).padStart(2, '0')}
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
                    {item.author} <em>{item.relation}</em>
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
          <img src="./image/chrysanthemum-offering-front.png" alt="국화" />
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
            {[0, 1, 2].map((idx) => (
              <S.PhotoChoice
                key={idx}
                type="button"
                $isSelected={selectedPhotoIndex === idx}
                $bgImage={previewUrls[idx]}
                onClick={() => setSelectedPhotoIndex(idx)}
              >
                <span>사진 {idx + 1}</span>
              </S.PhotoChoice>
            ))}
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
          <S.SubmitMemory type="submit">추념하기</S.SubmitMemory>
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
};