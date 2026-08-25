// src/styles/GlobalStyle.ts
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root{
    /* Brand & Sub */
    --green100:      ${({theme}) => theme.colors.green100};
    --mint100:       ${({theme}) => theme.colors.mint100};
    --whitegreen100: ${({theme}) => theme.colors.whitegreen100};
    --gradient-greenmint: ${({theme}) => theme.colors.greenmintGradient};

    /* Background */
    --bg:            ${({theme}) => theme.colors.bg};

    /* Gray */
    --gray100:     ${({theme}) => theme.colors.gray100};
    --gray200:     ${({theme}) => theme.colors.gray200};
    --gray300:     ${({theme}) => theme.colors.gray300};
    --gray400:     ${({theme}) => theme.colors.gray400};
    --coolgray100: ${({theme}) => theme.colors.coolgray100};
    --gray500:     ${({theme}) => theme.colors.gray500};
    --gray600:     ${({theme}) => theme.colors.gray600};
    --gray700:     ${({theme}) => theme.colors.gray700};
    --gray800:     ${({theme}) => theme.colors.gray800};

    /* BW */
    --white: ${({theme}) => theme.colors.white};
    --black: ${({theme}) => theme.colors.black};

    /* Radius / Shadow / Container */
    --radius-sm:   ${({theme}) => theme.radius.sm};
    --radius-md:   ${({theme}) => theme.radius.md};
    --radius-lg:   ${({theme}) => theme.radius.lg};
    --radius-xl:   ${({theme}) => theme.radius.xl};
    --radius-pill: ${({theme}) => theme.radius.pill};
    --shadow-card: ${({theme}) => theme.shadow.card};

    /* 컨테이너 */
    --container-max: ${({theme}) => theme.container.max};
    --container-gx:  16.5rem;   /* ← 여기서 한 번만 선언 */
  }

  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; width: 100%; min-width: 0; margin: 0; max-width: none !important; }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--gray800);
    font-family: ${({theme}) => theme.font.family};
    font-size:   ${({theme}) => theme.font.size.body};
    line-height: ${({theme}) => theme.font.lh.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-family: "Noto Serif KR";

  }

  .container {
    max-width: var(--container-max);
    padding-left: var(--container-gx);
    padding-right: var(--container-gx);
    margin: 0 auto;
  }

  h1,h2,h3,h4,h5 {
    font-family: inherit;
  }
`;
