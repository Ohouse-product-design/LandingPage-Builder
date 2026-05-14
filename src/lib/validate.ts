/**
 * UI Spec 검증 유틸.
 * 인스펙터 입력 필드와 [검수] 액션에서 사용.
 */

import type { FieldSpec, UISpec } from "@/schema/ui-spec";

export type ValidationError = {
  field: string;
  message: string;
};

export function validateField(value: unknown, spec: FieldSpec): string | null {
  if (spec.required && (value === undefined || value === null || value === "")) {
    return "필수 입력 항목입니다";
  }
  if (typeof value === "string") {
    if (spec.maxChar !== undefined && value.length > spec.maxChar) {
      return `최대 ${spec.maxChar}자까지 입력 가능합니다 (현재 ${value.length}자)`;
    }
    if (spec.maxLine !== undefined) {
      const lines = value.split(/\r?\n/);
      if (lines.length > spec.maxLine) {
        return `최대 ${spec.maxLine}줄까지 입력 가능합니다 (현재 ${lines.length}줄)`;
      }
    }
  }
  return null;
}

export function validateProps(
  props: Record<string, unknown>,
  spec: UISpec
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const [field, fieldSpec] of Object.entries(spec)) {
    const message = validateField(props[field], fieldSpec);
    if (message) errors.push({ field, message });
  }
  return errors;
}

export function countChars(value: unknown): number {
  if (typeof value !== "string") return 0;
  return value.length;
}

export function countLines(value: unknown): number {
  if (typeof value !== "string") return 0;
  return value.split(/\r?\n/).length;
}
