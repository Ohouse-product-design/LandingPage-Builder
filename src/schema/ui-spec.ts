/**
 * UI Spec — 컴포넌트별 글자수/줄수/필수 여부 제약.
 *
 * 어드민 인스펙터에서 사용자가 입력할 때 실시간으로 카운터를 보여주고,
 * 한도 초과 시 빨간 보더 + 저장 차단을 위한 데이터.
 */

export interface FieldSpec {
  /** 최대 글자수 */
  maxChar?: number;
  /** 최대 줄수 (CSS line-clamp 와 매칭) */
  maxLine?: number;
  /** 필수 입력 */
  required?: boolean;
  /** 입력 타입 — 'text' | 'number' | 'enum' | 'asset' | 'tokenRef' */
  inputType?: "text" | "number" | "enum" | "asset" | "tokenRef" | "url";
  /** enum 옵션 */
  enumOptions?: { value: string; label: string }[];
  /** 도움말 */
  help?: string;
}

/** 컴포넌트/섹션 전체에 대한 UI Spec — key = prop 이름 */
export type UISpec = Record<string, FieldSpec>;
