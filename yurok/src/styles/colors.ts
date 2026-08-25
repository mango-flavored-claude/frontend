// src/styles/colors.ts
// Figma 팔레트 통합 (필요시 HEX만 바꿔도 됩니다)
export const colors = {
  // Brand / Sub
  green100:  "#57D287",
  mint100:   "#30D6A4",
  greenmintGradient: "linear-gradient(360deg, #57D287 0, #30D6A4 100%)",
  whitegreen100: "#F0FFF0",

  // Background
  bg: "#FFFFFF",

  // Grayscale
  gray100:     "#F7F7F7",
  gray200:     "#F5F5F5",
  gray300:     "#D9D9D9",
  gray400:     "#EEEEEE",
  coolgray100: "#EEF0F5",
  gray500:     "#868686",
  gray600:     "#333333",
  gray700:     "#525252",
  gray800:     "#111111",

  // BW
  white: "#FFFFFF",
  black: "#000000",
};
export type Colors = typeof colors;
