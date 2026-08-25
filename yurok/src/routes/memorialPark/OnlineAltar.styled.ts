import styled, { keyframes, css } from 'styled-components';

const flowerAppear = keyframes`
  0% {
    opacity: 0.04;
    filter: blur(9px) saturate(0.55) brightness(1.12);
    transform: translateY(16px) scale(0.6) rotate(var(--rotation));
  }
  50% {
    opacity: 0.48;
    filter: blur(3px) saturate(0.68) brightness(1.05);
  }
  100% {
    opacity: 1;
    filter: blur(0) saturate(0.78) contrast(1.03) brightness(1.01) drop-shadow(0 4px 3px rgba(41,31,24,0.2));
    transform: translateY(0) scale(var(--scale)) rotate(var(--rotation));
  }
`;

const toast = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -8px);
  }
  18%, 70% {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -5px);
  }
`;

const sceneBrighten = keyframes`
  0%, 10% { opacity: 0.64; }
  42% { opacity: 0.46; }
  72% { opacity: 0.24; }
  100% { opacity: 0; }
`;

const guidanceLineAnim = keyframes`
  0% {
    opacity: 0;
    filter: blur(3px);
    transform: translateY(7px);
  }
  17%, 72% {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(-5px);
  }
`;

const bounce = keyframes`
  50% { transform: translateY(5px); }
`;

const softFade = keyframes`
  0% {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  44%, 56% {
    opacity: 1;
    backdrop-filter: blur(13px);
  }
  100% {
    opacity: 0;
    backdrop-filter: blur(0);
  }
`;

export const Container = styled.div<{ $isPageTransitioning: boolean }>`
  --ink: #29251f;
  --brown: #473328;
  --paper: #f5f1e8;
  --muted: #776e64;
  --line: #c8beb1;

  margin: 0;
  color: var(--ink);
  background: var(--paper);
  font-family: Arial, "Noto Sans KR", sans-serif;
  scroll-behavior: auto;
  scroll-snap-type: y mandatory;
  ${({ $isPageTransitioning }) =>
    $isPageTransitioning &&
    css`
      overflow: hidden;
    `}

  button, textarea, input {
    font: inherit;
  }
  button {
    cursor: pointer;
  }
`;

export const AltarSection = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 100vh;
  display: block;
  overflow: hidden;
  background: #eee8dd;
  scroll-snap-align: start;
  scroll-snap-stop: always;
`;

export const SceneStage = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #e9e0d3;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 0 -70px 90px rgba(36, 27, 21, 0.08);
  }
`;

export const AltarArtboard = styled.div`
  position: absolute;
  z-index: 1;
  left: 50%;
  top: 50%;
  width: max(100%, calc(100vh * 1.77966));
  height: max(100%, calc(100vw / 1.77966));
  background: url('./yurok-altar-vector-v9-blank-nameplate.png') center/100% 100% no-repeat;
  transform: translate(-50%, -50%);
`;

export const RoomTitle = styled.div`
  position: absolute;
  z-index: 4;
  left: 3.5%;
  top: 4%;
  padding-left: 14px;
  border-left: 2px solid rgba(82, 61, 45, 0.45);

  span {
    display: block;
    color: #81766b;
    font-size: 8px;
    letter-spacing: 0.16em;
  }
  strong {
    display: block;
    margin-top: 6px;
    font: 400 15px "Batang", serif;
  }

  @media (max-width: 900px) {
    display: none;
  }
`;

export const LifeDates = styled.div`
  margin-top: 9px;
  color: #6f645a;
  font: 9px/1.5 Arial, sans-serif;
  letter-spacing: 0.08em;
`;

export const FlowerLayer = styled.div`
  position: absolute;
  z-index: 5;
  inset: 0;
  pointer-events: none;
`;

export const NameplateName = styled.div`
  position: absolute;
  z-index: 7;
  left: 48.333%;
  top: 49.153%;
  width: 2.143%;
  height: 13.136%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  container-type: inline-size;
  pointer-events: none;

  span {
    color: #17130f;
    font: 600 clamp(11px, 1vw, 17px)/1 "Batang", serif;
    font-size: 46cqw;
    letter-spacing: 0.1em;
    writing-mode: vertical-rl;
    text-orientation: upright;
    white-space: nowrap;
  }
`;

export const OfferingFlower = styled.img<{
  $isNew: boolean;
  $left: number;
  $bottom: number;
  $zIndex: number;
  $rotation: number;
  $scale: number;
}>`
  position: absolute;
  width: 8.2%;
  aspect-ratio: 1;
  object-fit: contain;
  transform-origin: 50% 100%;
  clip-path: inset(0 0 13% 0);
  opacity: 1;
  filter: saturate(0.78) contrast(1.03) brightness(1.01) drop-shadow(0 4px 3px rgba(41, 31, 24, 0.2));
  image-rendering: auto;
  left: ${({ $left }) => $left}%;
  bottom: ${({ $bottom }) => $bottom}%;
  z-index: ${({ $zIndex }) => $zIndex};
  --rotation: ${({ $rotation }) => $rotation}deg;
  --scale: ${({ $scale }) => $scale};

  ${({ $isNew, $scale, $rotation }) =>
    $isNew
      ? css`
          animation: ${flowerAppear} 2.1s cubic-bezier(0.2, 0.75, 0.2, 1) both;
        `
      : css`
          opacity: 1;
          transform: scale(${$scale}) rotate(${$rotation}deg);
        `}
`;

export const CompleteToast = styled.div`
  position: absolute;
  z-index: 10;
  top: 11%;
  left: 50%;
  padding: 0;
  border: 0;
  color: #3d3027;
  background: transparent;
  backdrop-filter: none;
  font: 600 15px/1.65 "Batang", serif;
  text-shadow: 0 5px 18px rgba(69, 50, 37, 0.13);
  transform: translate(-50%, -8px);
  opacity: 0;
  animation: ${toast} 3.6s 11.1s ease both;
`;

export const EntranceDimmer = styled.div`
  position: absolute;
  z-index: 20;
  inset: 0;
  pointer-events: none;
  background: #17120f;
  animation: ${sceneBrighten} 9.2s 0.1s ease-in-out both;
`;

export const FuneralGuidance = styled.div`
  position: absolute;
  z-index: 25;
  right: 5.5%;
  top: 7%;
  width: min(650px, 58vw);
  height: 66px;
  pointer-events: none;
  color: #382d25;
  text-align: right;

  .guidance-line {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center end;
    margin: 0;
    opacity: 0;
    color: #fff;
    font: 700 24px/1.65 "Batang", serif;
    letter-spacing: -0.025em;
    text-shadow: 0 2px 7px rgba(16, 12, 10, 0.58);

    &:nth-child(1) {
      animation: ${guidanceLineAnim} 3s 0.4s ease-in-out both;
    }
    &:nth-child(2) {
      animation: ${guidanceLineAnim} 2.8s 3.3s ease-in-out both;
    }
    &:nth-child(3) {
      animation: ${guidanceLineAnim} 3.1s 6s ease-in-out both;
    }
  }
`;

export const ScrollButton = styled.button`
  position: absolute;
  z-index: 12;
  left: 50%;
  bottom: 18px;
  width: 160px;
  padding: 0 0 5px;
  display: grid;
  place-items: center;
  gap: 4px;
  border: 0;
  color: #40352d;
  background: transparent;
  transform: translateX(-50%);

  span {
    color: #81766b;
    font-size: 7px;
    letter-spacing: 0.24em;
  }
  strong {
    font-size: 10px;
  }
  i {
    font-style: normal;
    animation: ${bounce} 1.4s infinite;
  }
`;

export const PageTransition = styled.div<{ $isRun: boolean }>`
  position: fixed;
  z-index: 55;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background: rgba(238, 233, 223, 0.76);
  backdrop-filter: blur(0);

  ${({ $isRun }) =>
    $isRun &&
    css`
      animation: ${softFade} 0.9s ease-in-out both;
    `}
`;

export const MemorySection = styled.section`
  position: relative;
  min-height: 125vh;
  padding: 96px 7vw 180px;
  overflow: hidden;
  background-color: #eee9df;
  background-image: url('./yurok-ink-line-background.svg'),
    linear-gradient(90deg, rgba(99, 82, 62, 0.025) 1px, transparent 1px),
    linear-gradient(rgba(99, 82, 62, 0.02) 1px, transparent 1px),
    radial-gradient(ellipse at 72% 22%, rgba(107, 90, 67, 0.07), transparent 34%);
  background-repeat: no-repeat, repeat, repeat, no-repeat;
  background-position: center, center, center, center;
  background-size: cover, 7px 7px, 9px 9px, 100% 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;

  &::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 0;
    height: 52px;
    border-left: 1px solid rgba(89, 71, 55, 0.26);
  }

  @media (max-width: 900px) {
    padding-inline: 5vw;
  }
`;

export const MemoryHeading = styled.header`
  position: relative;
  z-index: 2;
  max-width: 1260px;
  margin: 0 auto 82px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 0 38px;
  border-bottom: 1px solid rgba(80, 62, 48, 0.34);

  .eyebrow {
    margin: 1px 0 12px;
    color: #7d6e61;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.25em;
  }
  h2 {
    margin: 0;
    font: 400 43px/1.4 "Batang", serif;
    letter-spacing: -0.06em;
  }

  aside {
    display: flex;
    align-items: center;
    gap: 38px;

    button {
      height: 48px;
      padding: 0 22px;
      border: 1px solid #513b2e;
      color: #fff;
      background: #513b2e;
      box-shadow: 4px 5px 0 rgba(65, 46, 33, 0.12);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
      transition: 0.25s ease;

      &:hover {
        color: #513b2e;
        background: #f2ede5;
        transform: translateY(-2px);
      }
    }
  }

  @media (max-width: 900px) {
    align-items: flex-start;

    aside {
      flex-direction: column;
      align-items: flex-end;
    }
  }
`;

export const MemoryTitleWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;
`;

export const MemoryMark = styled.span`
  width: 46px;
  height: 58px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(69, 50, 38, 0.64);
  color: #f3eee5;
  background: #513b2e;
  box-shadow: 5px 6px 0 rgba(78, 58, 42, 0.09);
  font: 400 23px "Batang", serif;
`;

export const MemorySummary = styled.div`
  padding-left: 19px;
  border-left: 1px solid rgba(97, 77, 60, 0.35);

  b {
    display: block;
    margin-bottom: 5px;
    color: #4f4136;
    font: 400 16px "Batang", serif;
  }
  p {
    margin: 0;
    color: #766d64;
    font: 11px/1.8 "Batang", serif;
  }
`;

export const Garden = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1180px;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 82px 9%;

  @media (max-width: 900px) {
    gap: 60px 5%;
  }
`;

export const MemoryOpen = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #65594f;
  font-size: 9px;

  i {
    width: 25px;
    height: 25px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(84, 68, 55, 0.38);
    font-style: normal;
    transition: 0.2s ease;
  }
`;

export const MemoryCard = styled.button`
  position: relative;
  width: 100%;
  min-height: 430px;
  padding: 0;
  display: grid;
  grid-template-rows: 330px auto;
  overflow: visible;
  border: 0;
  color: #302a25;
  background: transparent;
  box-shadow: none;
  text-align: left;
  transition: transform 0.4s ease, opacity 0.35s ease;

  &:nth-child(even) {
    transform: translateY(112px);
  }

  &:hover {
    background: transparent;
    box-shadow: none;
    transform: translateY(-5px);

    ${MemoryOpen} i {
      color: #fff;
      background: #513b2e;
    }
  }

  &:nth-child(even):hover {
    transform: translateY(107px);
  }
`;

export const MemoryPlaceholder = styled.div`
  position: relative;
  width: 330px;
  max-width: 84%;
  aspect-ratio: 1;
  align-self: center;
  justify-self: center;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  color: transparent;
  background: radial-gradient(
    circle at 47% 43%,
    rgba(93, 93, 91, 0.21) 0 55%,
    rgba(93, 93, 91, 0.13) 68%,
    rgba(93, 93, 91, 0.035) 79%,
    transparent 84%
  );
  filter: blur(0.35px) saturate(0.55);
  mix-blend-mode: multiply;
  opacity: 0.72;
  transition: opacity 0.35s ease, filter 0.35s ease, transform 0.45s ease;

  &::before {
    content: "";
    position: absolute;
    inset: 13%;
    border-radius: 50%;
    background: rgba(119, 116, 110, 0.08);
    filter: blur(18px);
  }

  .memory-index,
  .placeholder-symbol,
  p {
    display: none;
  }

  ${MemoryCard}:hover & {
    opacity: 0.88;
    filter: blur(0) saturate(0.62);
    transform: scale(1.012);
  }

  ${MemoryCard}:nth-child(even) & {
    opacity: 0.62;
  }
`;

export const MemoryCopy = styled.div`
  min-height: 86px;
  padding: 12px 13%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(92, 75, 60, 0.16);
`;

export const MemoryAuthor = styled.div`
  display: grid;
  gap: 7px;

  small {
    color: #8b8076;
    font-size: 8px;
    letter-spacing: 0.12em;
  }
  strong {
    font: 400 14px "Batang", serif;
  }
  em {
    margin-left: 8px;
    color: #81766c;
    font: normal 9px Arial, sans-serif;
  }
`;

export const GardenEnd = styled.div`
  position: relative;
  z-index: 2;
  margin: 190px auto 0;
  width: 280px;
  padding: 30px;
  border-top: 1px solid rgba(101, 82, 65, 0.38);
  border-bottom: 1px solid rgba(101, 82, 65, 0.38);
  color: #776f66;
  background: rgba(248, 244, 237, 0.3);
  text-align: center;

  img {
    width: 42px;
    height: 42px;
    object-fit: contain;
    filter: grayscale(0.18) saturate(0.55);
  }
  p {
    margin: 9px 0 0;
    font: 11px/1.8 "Batang", serif;
  }
`;

export const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  z-index: 60;
  inset: 0;
  display: ${({ $isOpen }) => ($isOpen ? 'grid' : 'none')};
  place-items: center;
  padding: 40px;
  background: rgba(38, 31, 26, 0.6);
  backdrop-filter: blur(4px);
`;

export const ModalCard = styled.article`
  position: relative;
  width: 590px;
  padding: 48px;
  border: 1px solid #796b60;
  background-color: #f8f4ec;
  background-image: linear-gradient(90deg, rgba(98, 80, 63, 0.025) 1px, transparent 1px),
    linear-gradient(rgba(98, 80, 63, 0.02) 1px, transparent 1px);
  background-size: 7px 7px, 9px 9px;
  box-shadow: 18px 22px 0 rgba(34, 27, 22, 0.13);

  .eyebrow {
    margin: 0 0 11px;
    color: #887b70;
    font-size: 8px;
    letter-spacing: 0.2em;
  }
  h3 {
    margin: 0 0 28px;
    font: 400 28px/1.5 "Batang", serif;
  }
`;

export const MemoryComposer = styled.form`
  position: relative;
  width: 650px;
  padding: 52px 56px 46px;
  overflow: hidden;
  border: 0;
  background-color: #eee5d5;
  background-image: radial-gradient(ellipse at 18% 12%, rgba(114, 91, 65, 0.08), transparent 37%),
    radial-gradient(ellipse at 84% 72%, rgba(114, 91, 65, 0.06), transparent 42%),
    repeating-linear-gradient(3deg, rgba(99, 78, 55, 0.022) 0 1px, transparent 1px 7px),
    repeating-linear-gradient(94deg, rgba(116, 93, 67, 0.018) 0 1px, transparent 1px 9px);
  box-shadow: 19px 24px 0 rgba(34, 27, 22, 0.13), inset 0 0 55px rgba(115, 86, 53, 0.08);

  &::before {
    content: "";
    position: absolute;
    inset: 12px;
    border: 1px solid rgba(91, 67, 44, 0.12);
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  .eyebrow {
    margin: 0 0 11px;
    color: #887b70;
    font-size: 8px;
    letter-spacing: 0.2em;
  }
  h3 {
    margin: 0 0 28px;
    font: 400 28px/1.5 "Batang", serif;
  }

  textarea {
    width: 100%;
    height: 190px;
    margin: 0 0 9px;
    padding: 4px 2px;
    border: 0;
    color: #3f3832;
    background: transparent;
    resize: none;
    outline: none;
    font: 15px/2.05 "Batang", serif;

    &::placeholder {
      color: rgba(73, 61, 51, 0.48);
    }
  }
`;

export const ModalClose = styled.button`
  position: absolute;
  right: 17px;
  top: 14px;
  border: 0;
  background: transparent;
  font-size: 22px;
`;

export const PhotoRow = styled.div`
  margin: -8px 0 4px;
  display: flex;
  align-items: flex-end;
  min-height: 102px;
  padding-left: 4px;

  input[type="file"] {
    display: none;
  }
`;

export const PhotoChoice = styled.button<{ $isSelected: boolean; $bgImage?: string }>`
  position: relative;
  width: 104px;
  height: 78px;
  margin-right: -9px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid transparent;
  color: #83776c;
  background: radial-gradient(
    circle at 46% 42%,
    rgba(112, 108, 103, 0.25),
    rgba(112, 108, 103, 0.12) 63%,
    transparent 72%
  );
  background-position: center;
  background-size: cover;
  box-shadow: 0 7px 15px rgba(69, 51, 37, 0.07);
  font-size: 9px;
  transition: 0.22s ease;

  ${({ $bgImage }) =>
    $bgImage &&
    css`
      background-image: url("${$bgImage}");
      span {
        opacity: 0;
      }
    `}

  &:nth-child(1) {
    transform: rotate(-2.5deg);
  }
  &:nth-child(2) {
    transform: translateY(4px) rotate(1.5deg);
  }
  &:nth-child(3) {
    transform: rotate(-0.8deg);
  }

  ${({ $isSelected }) =>
    $isSelected &&
    css`
      z-index: 3;
      border-color: #513b2e;
      box-shadow: 0 0 0 2px rgba(238, 229, 213, 0.85), 0 8px 18px rgba(69, 51, 37, 0.13);
    `}
`;

export const PhotoAdd = styled.label`
  width: 74px;
  height: 58px;
  margin: 0 0 4px 21px;
  display: grid;
  place-items: center;
  border: 0;
  border-bottom: 1px solid rgba(83, 65, 50, 0.4);
  color: #66584d;
  background: transparent;
  cursor: pointer;
  font-size: 9px;

  b {
    margin-right: 5px;
    font-size: 15px;
    font-weight: 300;
  }
`;

export const AiPhotoGuide = styled.p`
  margin: 8px 0 21px;
  color: #83786d;
  font: 9px/1.7 "Batang", serif;
  text-align: right;
`;

export const SubmitMemory = styled.button`
  width: 100%;
  height: 50px;
  border: 1px solid #49362a;
  color: #fff;
  background: #49362a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
`;

export const DetailText = styled.p`
  margin: 0;
  color: #574f47;
  font: 15px/1.9 "Batang", serif;
`;

export const DetailAuthor = styled.p`
  margin-top: 20px;
  color: #7b7167;
  font-size: 10px;
`;