// src/styles/theme.ts
import { colors } from "./colors";

/** 공통 라인하이트 기본값 (피그마 표의 대부분) */
const LH_130 = "130%";

/** 필요할 때 쓰는 helper */
const em = (n: number) => `${n}em`;

export const theme = {
  colors,

  /** 기존 GlobalStyle에서 기대하는 기본 font 구조 유지 */
  font: {
    family:
      "'Pretendard', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans KR'",
    size: {
      body: "1rem",     /* 16px → 1rem */
      h1: "2rem",       /* 32px → 2rem */
      h2: "1.5rem",     /* 24px → 1.5rem */
      h3: "1.25rem",    /* 20px → 1.25rem */
      small: "0.75rem", /* 12px → 0.75rem */
    },
    lh: {
      body: "1.5rem", /* 24px → 1.5rem */
      h1: "2.5rem",   /* 40px → 2.5rem */
      h2: "2rem",     /* 32px → 2rem */
      h3: "1.75rem",  /* 28px → 1.75rem */
    },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  },

  /** ▶ Figma JSON 기반 타이포 토큰 */
  typography: {
    // Head
    head1_sb_36: { fontSize: "2.25rem", fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.036111) }, // 36px
    head2_sb_32: { fontSize: "2rem",    fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.040625) }, // 32px
    head3_sb_30: { fontSize: "1.875rem",fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.043333) }, // 30px
    head4_sb_26: { fontSize: "1.625rem",fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.05) },     // 26px
    head5_r_26:  { fontSize: "1.625rem",fontWeight: 400, lineHeight: LH_130, letterSpacing: em(0.05) },     // 26px
    head6_sb_22: { fontSize: "1.375rem",fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.059091) }, // 22px
    head7_m_17:  { fontSize: "1.0625rem",fontWeight: 500,lineHeight: "120%", letterSpacing: em(0.076471) }, // 17px

    // Sub
    sub1_sb_20:  { fontSize: "1.25rem", fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.065) },    // 20px
    sub2_sb_17:  { fontSize: "1.0625rem",fontWeight: 600,lineHeight: LH_130, letterSpacing: em(0.076471) },// 17px
    sub3_sb_15:  { fontSize: "0.9375rem",fontWeight: 600,lineHeight: LH_130, letterSpacing: em(0.086667) },// 15px
    sub4_r_16:   { fontSize: "1rem",    fontWeight: 400, lineHeight: LH_130, letterSpacing: em(0.08125) }, // 16px
    sub5_r_15:   { fontSize: "0.9375rem",fontWeight: 400,lineHeight: LH_130, letterSpacing: em(0.086667) },// 15px
    sub6_r_12:   { fontSize: "0.75rem", fontWeight: 400, lineHeight: LH_130, letterSpacing: em(0.108333) },// 12px

    // Body
    body1_m_20:  { fontSize: "1.25rem", fontWeight: 500, lineHeight: LH_130, letterSpacing: em(0.065) },    // 20px
    body2_r_17:  { fontSize: "1.0625rem",fontWeight: 400,lineHeight: LH_130, letterSpacing: em(0.076471) },// 17px
    body3_sb_15: { fontSize: "0.9375rem",fontWeight: 600,lineHeight: LH_130, letterSpacing: em(0.086667) },// 15px
    body4_sb_14: { fontSize: "0.875rem", fontWeight: 600, lineHeight: LH_130, letterSpacing: em(0.092857) },// 14px
    body5_r_14:  { fontSize: "0.875rem", fontWeight: 400, lineHeight: LH_130, letterSpacing: em(0.092857) },// 14px
    body6_m_13:  { fontSize: "0.8125rem",fontWeight: 500,lineHeight: "130%", letterSpacing: em(0.1) },     // 13px
    body7_r_13:  { fontSize: "0.8125rem",fontWeight: 400,lineHeight: "130%", letterSpacing: em(0.1) },     // 13px
  },

  radius: {
    sm: "0.5rem",   /* 8px → 0.5rem */
    md: "0.75rem",  /* 12px → 0.75rem */
    lg: "1rem",     /* 16px → 1rem */
    xl: "1.25rem",  /* 20px → 1.25rem */
    pill: "999px",
  },
  shadow: { card: "0 0.25rem 1rem rgba(0,0,0,0.06)" }, /* 0 4px 16px → 0 0.25rem 1rem */
  container: { max: "75rem", gutterX: "1.5rem" }, /* 1200px → 75rem, 24px → 1.5rem */
} as const;

export type AppTheme = typeof theme;
