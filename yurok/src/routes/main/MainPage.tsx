import React, { useRef, useState, WheelEvent } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useUser } from '../../store/UserContext';
import { publicAsset } from '../../utils/publicAsset';

const mainBackground = publicAsset('image/yurok-ink-line-background.svg');

// ==========================================
// 2. 각 페이지(섹션) 컴포넌트
// ==========================================

interface NavigablePageProps {
  onNavigate?: (index: number) => void;
}

// 첫 번째 페이지
const FirstPage: React.FC<NavigablePageProps> = ({ onNavigate }) => {
  return (
    <PageSection>
      <Hero>
        <HeroCopy>
          <Eyebrow>남길 遺 · 기록할 錄</Eyebrow>
          <HeroTitle>
            멀리 있어도,
            <br />
            마음을 모을 수 있도록.
          </HeroTitle>
          <HeroDescription>
            무빈소 장례를 위한 온라인 조문 공간.
            <br />
            장례의 시간은 함께하고, 남은 기억은 오래 간직합니다.
          </HeroDescription>
          <HeroActions>
            <PrimaryButton to={'/request'}>온라인 빈소 신청하기</PrimaryButton>
            <SecondaryButton onClick={() => onNavigate?.(1)}>
              서비스 알아보기
            </SecondaryButton>
          </HeroActions>
          <HeroNote>
            <span>장례식장 없이 온라인 개설</span>
            <span>초대 링크 하나로 조문</span>
            <span>유족이 직접 관리</span>
          </HeroNote>
        </HeroCopy>
        <HeroVisual>
          <HeroImage
            src={publicAsset('image/yurok-altar-vector-v6.png')}
            alt="유록 온라인 빈소 예시"
          />
        </HeroVisual>
      </Hero>
    </PageSection>
  );
};

// 두 번째 페이지
const SecondPage: React.FC = () => {
  return (
    <PageSection>
      <Intro>
        <SectionHeading>
          <div>
            <p>HOW IT WORKS</p>
            <h2>
              조문부터 추억 보관까지
              <br />
              하나의 링크로 이어집니다.
            </h2>
          </div>
        </SectionHeading>
        <Steps>
          <StepCard>
            <span>01</span>
            <h3>온라인 빈소 개설</h3>
            <p>
              고인 정보와 장례 기간을 입력하고 원하는 작성 인원과 보관기간을
              선택합니다.
            </p>
          </StepCard>
          <StepCard>
            <span>02</span>
            <h3>초대 링크 전달</h3>
            <p>
              가족과 지인에게 링크를 전달하면 방명록 작성과 온라인 헌화가
              시작됩니다.
            </p>
          </StepCard>
          <StepCard>
            <span>03</span>
            <h3>추억관으로 보관</h3>
            <p>
              장례 종료 후 빈소는 추억관으로 전환되고 선택한 기간 동안 기억을
              보관합니다.
            </p>
          </StepCard>
        </Steps>
      </Intro>
    </PageSection>
  );
};

// 세 번째 페이지
const ThirdPage: React.FC = () => {
  return (
    <PageSection>
      <Plans>
        <SectionHeading>
          <div>
            <p>PLAN</p>
            <h2>
              필요한 규모와 기간만큼 선택하세요.
            </h2>
          </div>
        </SectionHeading>
        <PlanGrid>
          <PlanCard>
            <span className="tag">SMALL</span>
            <h3>50명</h3>
            <span className="count">가족·가까운 지인 중심</span>
            <ul>
              <li>글쓰기 최대 50명</li>
              <li>AI 추억 풍경 최대 50개</li>
            </ul>
            <strong>69,000원~</strong>
          </PlanCard>
          <PlanCard $featured>
            <span className="tag">RECOMMENDED</span>
            <h3>200명</h3>
            <span className="count">일반적인 지인 범위</span>
            <ul>
              <li>글쓰기 최대 200명</li>
              <li>AI 추억 풍경 최대 200개</li>
            </ul>
            <strong>99,000원~</strong>
          </PlanCard>
          <PlanCard>
            <span className="tag">LARGE</span>
            <h3>500명</h3>
            <span className="count">넓은 관계망과 단체 조문</span>
            <ul>
              <li>글쓰기 최대 500명</li>
              <li>AI 추억 풍경 최대 500개</li>
            </ul>
            <strong>139,000원~</strong>
          </PlanCard>
        </PlanGrid>
        <RetentionRow>
          <strong>추억관 공개 보관기간</strong>
          <span>1년</span>
          <span>5년</span>
          <span>10년</span>
        </RetentionRow>
      </Plans>
    </PageSection>
  );
};

const Header = () => {
  const { user, setUser } = useUser();

  return (
    <SiteHeader>
      <Brand>
        <BrandMark>遺錄</BrandMark>
        <BrandText>
          <strong>유록</strong>
          <small>온라인 추모 공간</small>
        </BrandText>
      </Brand>
      <Nav>
        {user ? (
          <>
            <UserName>{user.name}님</UserName>
            <LogoutButton type="button" onClick={() => setUser(null)}>
              로그아웃
            </LogoutButton>
          </>
        ) : (
          <NavButton to={'/login'}>로그인</NavButton>
        )}
        <ApplyButton to={'/request'}>온라인 빈소 신청하기</ApplyButton>
      </Nav>
    </SiteHeader>
  );
};

// ==========================================
// 3. 메인 FullPage 컨테이너
// ==========================================
const TOTAL_SECTIONS = 3;
const SCROLL_LOCK_MS = 800;

export const MainPage: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<number>(0);
  const isScrolling = useRef<boolean>(false);

  const goToSection = (index: number) => {
    if (isScrolling.current) return;
    if (index < 0 || index > TOTAL_SECTIONS - 1) return;

    isScrolling.current = true;
    setCurrentSection(index);

    setTimeout(() => {
      isScrolling.current = false;
    }, SCROLL_LOCK_MS);
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'down') goToSection(currentSection + 1);
    else goToSection(currentSection - 1);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0) handleScroll('down');
    else if (e.deltaY < 0) handleScroll('up');
  };

  return (
    <ScrollContainer onWheel={handleWheel}>
      <Header />
      <TrackWrapper $offset={currentSection}>
        <FirstPage onNavigate={goToSection} />
        <SecondPage />
        <ThirdPage />
      </TrackWrapper>

      <DotNav>
        {Array.from({ length: TOTAL_SECTIONS }).map((_, index) => (
          <Dot
            key={index}
            $active={currentSection === index}
            onClick={() => goToSection(index)}
            aria-label={`Page ${index + 1}`}
          />
        ))}
      </DotNav>
    </ScrollContainer>
  );
};

// ==========================================
// 0. 디자인 토큰
// ==========================================
const colors = {
  ink: '#29251f',
  muted: '#756d62',
  brown: '#5c4130',
  brownDark: '#39291f',
  paper: '#f5f1e8',
  paper2: '#ebe4d7',
  line: '#c9c0b2',
  white: '#fffdfa',
};

// ==========================================
// 1. 공통 스타일 컴포넌트 (반응형 대응)
// ==========================================

const SiteHeader = styled.header`
  position: fixed;
  top: 0;
  z-index: 30;
  height: 78px;
  padding-inline: 6.5vw;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(78, 58, 43, 0.13);
  background: rgba(250, 248, 243, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(56, 43, 33, 0.035);

  @media (max-width: 1200px) {
    height: 68px;
    padding-inline: 4vw;
  }

  @media (max-width: 768px) {
    padding-inline: 20px;
  }
`;

const Brand = styled.button`
  display: flex;
  align-items: center;
  gap: 13px;
  border: 0;
  color: ${colors.ink};
  background: transparent;
`;

const BrandMark = styled.span`
  width: auto;
  height: auto;
  display: inline-flex;
  align-items: center;
  color: #402f24;
  font: 600 21px/1 'Batang', serif;
  letter-spacing: -0.1em;

  &::after {
    content: '';
    display: inline-block;
    width: 1px;
    height: 25px;
    margin-left: 13px;
    vertical-align: middle;
    background: #cfc5b8;
  }
`;

const BrandText = styled.span`
  display: flex;
  flex-direction: column;

  strong {
    font-family: 'Batang', serif;
    font-size: 18px;
    letter-spacing: 0.13em;
  }

  small {
    margin-top: 4px;
    color: #9a8e81;
    font-size: 7px;
    letter-spacing: 0.2em;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 940px) {
    gap: 8px;
  }
`;

const NavButton = styled(Link)`
  height: 40px;
  padding-inline: 19px;
  border: 1px solid #7b6858;
  background: transparent;
  font-size: 11px;
  transition: 0.2s ease;
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
    background: #594131;
  }

  @media (max-width: 1200px) {
    height: 36px;
    padding-inline: 14px;
    font-size: 10px;
  }
`;

const UserName = styled.span`
  height: 40px;
  padding-inline: 19px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #463226;

  @media (max-width: 1200px) {
    height: 36px;
    padding-inline: 14px;
    font-size: 10px;
  }
`;

const LogoutButton = styled.button`
  height: 40px;
  padding-inline: 14px;
  border: 1px solid #c5baad;
  background: transparent;
  color: #756c62;
  font-size: 10.5px;
  font-family: inherit;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #f4f2ec;
    color: #1a1a1a;
  }

  @media (max-width: 1200px) {
    height: 36px;
    padding-inline: 10px;
    font-size: 9.5px;
  }
`;

const ApplyButton = styled(NavButton)`
  color: white;
  border-color: #463226;
  background: #463226;
  box-shadow: 0 6px 16px rgba(63, 45, 34, 0.13);

  &:hover {
    background: #2e211a;
    transform: translateY(-1px);
  }
`;

// --- 히어로 (1페이지) ---
const Hero = styled.section`
  min-height: calc(100vh - 78px);
  margin-top: 78px;
  display: grid;
  grid-template-columns: 48% 52%;
  background: #f7f3eb;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  @media (max-height: 800px) {
    min-height: calc(100vh - 68px);
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 2;
  padding: clamp(30px, 6vh, 80px) 5vw clamp(30px, 6vh, 80px) 7.5vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #f7f3eb;
  background-image: url('${mainBackground}');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  text-align: left;

  &::before {
    content: '';
    position: absolute;
    left: 7.5vw;
    top: 5vh;
    width: 38px;
    border-top: 2px solid #81624b;
  }

  @media (max-width: 1024px) {
    padding: 60px 24px;

    &::before {
      left: 24px;
      top: 30px;
    }
  }
`;

const Eyebrow = styled.p`
  margin: 0 0 16px;
  color: #8b705d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.22em;
`;

const HeroTitle = styled.h1`
  margin: 16px 0 0;
  max-width: 510px;
  font: 400 clamp(28px, 3.2vw, 48px) / 1.4 'Batang', serif;
  letter-spacing: -0.055em;
`;

const HeroDescription = styled.p`
  margin: 20px 0 30px;
  color: #746a60;
  font: clamp(12px, 1.1vw, 14px) / 1.8 'Batang', serif;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
`;

const buttonBase = css`
  min-height: 46px;
  padding-inline: 20px;
  font-size: 12px;
  font-weight: 700;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease;

  @media (min-width: 1440px) {
    min-height: 51px;
    padding-inline: 24px;
    font-size: 13px;
  }
`;

const PrimaryButton = styled(Link)`
  ${buttonBase}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1px solid #463226;
  color: white;
  background: #463226;
  box-shadow: 0 8px 20px rgba(67, 48, 36, 0.12);

  &:hover {
    background: #2f221b;
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(67, 48, 36, 0.18);
  }
`;

const SecondaryButton = styled.button`
  ${buttonBase}
  border: 1px solid #a59686;
  color: #4f463d;
  background: rgba(255, 255, 255, 0.32);

  &:hover {
    border-color: #685444;
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(-2px);
  }
`;

const HeroNote = styled.div`
  margin-top: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  color: #94897d;
  font-size: 9px;

  span::before {
    content: '·';
    margin-right: 5px;
  }
`;

const HeroVisual = styled.div`
  position: relative;
  min-height: 350px;
  height: 100%;
  overflow: hidden;
  border-left: 1px solid rgba(86, 65, 48, 0.13);
  background: #dcd2c3;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(247, 243, 235, 0.18), transparent 28%),
      linear-gradient(0deg, rgba(36, 27, 21, 0.13), transparent 28%);
  }

  &:hover img {
    transform: scale(1.035);
  }

  @media (max-width: 1024px) {
    min-height: 300px;
    border-left: 0;
    border-top: 1px solid rgba(86, 65, 48, 0.13);
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: saturate(0.82) contrast(0.95);
  transform: scale(1.015);
  transition: transform 1.2s ease;
`;

// --- 서비스 소개 (2페이지) ---
const Intro = styled.section`
  padding-top: 78px;
  padding-bottom: 4vh;
  padding-inline: 7vw;
  background: #fdfbf7;
  text-align: left;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding-inline: 24px;
    padding-top: 100px;
  }
`;

const SectionHeading = styled.div`
  max-width: 1220px;
  width: 100%;
  margin-inline: auto;
  padding-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid ${colors.line};

  p {
    margin: 0 0 8px;
    color: #7d7267;
    font-size: 9px;
    letter-spacing: 0.2em;
  }

  h2 {
    margin: 0;
    font: 400 clamp(24px, 2.5vw, 36px) / 1.35 'Batang', serif;
    letter-spacing: -0.045em;
  }

  > span {
    max-width: 360px;
    color: #7d7368;
    font-size: 12px;
    line-height: 1.8;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const Steps = styled.div`
  max-width: 1220px;
  width: 100%;
  margin: clamp(20px, 4vh, 40px) auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(10px, 1.5vw, 18px);

  @media (max-width: 868px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.article`
  padding: clamp(18px, 2vw, 30px);
  border: 1px solid #d6cec3;
  background: #fffdfa;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;

  &:hover {
    border-color: #a99787;
    transform: translateY(-5px);
    box-shadow: 0 18px 35px rgba(68, 51, 38, 0.07);
  }

  > span {
    color: #9c8069;
    font: 12px monospace;
  }

  h3 {
    margin: clamp(20px, 3vh, 40px) 0 10px;
    font: bold clamp(16px, 1.5vw, 21px) 'Batang', serif;
  }

  p {
    margin: 0;
    color: #756d64;
    font-size: clamp(11px, 0.9vw, 12px);
    line-height: 1.7;
  }
`;

// --- 요금제 (3페이지) ---
const Plans = styled.section`
  padding-top: calc(78px + 3vh);
  padding-bottom: 3vh;
  padding-inline: 7vw;
  background-color: #eee7dc;
  background-image: radial-gradient(#cfc4b5 0.65px, transparent 0.65px);
  background-size: 6px 6px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    padding-inline: 24px;
    padding-top: 100px;
  }
`;

const PlanGrid = styled.div`
  max-width: 1220px;
  width: 100%;
  margin: clamp(20px, 3.5vh, 40px) auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(10px, 1.5vw, 18px);
  align-items: stretch;

  @media (max-width: 868px) {
    grid-template-columns: 1fr;
  }
`;

const PlanCard = styled.article<{ $featured?: boolean }>`
  position: relative;
  padding: clamp(18px, 2vw, 30px);
  border: 1px solid #c6b9aa;
  background: rgba(255, 253, 249, 0.9);
  transition: transform 0.22s ease, box-shadow 0.22s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 38px rgba(64, 47, 35, 0.09);
  }

  .tag {
    display: inline-block;
    padding: 4px 6px;
    color: #644733;
    background: #eadfd2;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 14px 0 4px;
    font: 400 clamp(20px, 2vw, 28px) 'Batang', serif;
  }

  .count {
    color: #665d53;
    font-size: 11px;
  }

  ul {
    margin: 16px 0;
    padding: 14px 0 0;
    border-top: 1px solid #d1c8bd;
    list-style: none;
  }

  li {
    margin: 6px 0;
    color: #6b6359;
    font-size: 10px;

    &::before {
      content: '—';
      margin-right: 7px;
    }
  }

  strong {
    display: block;
    padding-top: 12px;
    border-top: 1px solid #d1c8bd;
    color: #766b60;
    font-size: 11px;
  }

  ${(props) =>
    props.$featured &&
    css`
      border: 1px solid #6c4f3b;
      transform: translateY(-4px);
      box-shadow: 0 18px 38px rgba(64, 47, 35, 0.08);

      @media (min-width: 869px) {
        transform: translateY(-8px);
      }

      &:hover {
        transform: translateY(-10px);
      }
    `}
`;

const RetentionRow = styled.div`
  max-width: 1220px;
  width: 100%;
  margin: 16px auto 0;
  padding: 16px;
  display: grid;
  grid-template-columns: auto repeat(3, 1fr);
  align-items: center;
  gap: 8px;
  border: 1px solid #b7ac9d;
  background: rgba(255, 253, 249, 0.83);

  > strong {
    font-size: 11px;
    padding-right: 8px;
  }

  span {
    padding: 8px;
    border-left: 1px solid #c9bfb2;
    text-align: center;
    font: 700 clamp(12px, 1.2vw, 15px) 'Batang', serif;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    text-align: center;

    > strong {
      margin-bottom: 8px;
      padding-right: 0;
    }

    span {
      border-left: 0;
      border-top: 1px solid #c9bfb2;
    }
  }
`;

// --- 풀페이지 레이아웃 ---
const PageSection = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
`;

const ScrollContainer = styled.div`
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const TrackWrapper = styled.div<{ $offset: number }>`
  height: 100%;
  width: 100%;
  transform: translateY(-${(props) => props.$offset * 100}vh);
  transition: transform 0.8s ease-in-out;
`;

const DotNav = styled.div`
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;

  @media (max-width: 768px) {
    right: 10px;
    gap: 8px;
  }
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background-color: ${(props) =>
    props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'};
  transition: all 0.3s ease;
  transform: ${(props) => (props.$active ? 'scale(1.3)' : 'scale(1)')};

  @media (max-width: 768px) {
    width: 8px;
    height: 8px;
  }
`;

export default MainPage;
