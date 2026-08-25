// src/styles/layout.ts
import { css } from "styled-components";

/** flex 자식이 폭을 꽉 쓰면서 overflow 문제를 막는 유틸 */
export const fullFlexItem = css`
  flex: 1 1 auto;
  min-width: 0;     /* 긴 텍스트/테이블에서 꼭 필요 */
  width: 100%;
`;

/** 블록 요소를 100% 폭으로 강제 */
export const fullWidthBlock = css`
  display: block;
  width: 100%;
`;

/** 페이지 컨테이너: fluid=true면 100% 유동, 아니면 전역 container 토큰 사용 */
export const container = (fluid = true) => css`
  ${fluid
    ? `
      max-width: 100%;
      padding-left: 0;
      padding-right: 0;
      margin: 0;
    `
    : `
      max-width: var(--container-max);
      padding-left: var(--container-gx);
      padding-right: var(--container-gx);
      margin: 0 auto;
    `}
`;
