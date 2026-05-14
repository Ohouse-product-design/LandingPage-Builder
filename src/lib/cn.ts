import clsx, { type ClassValue } from "clsx";

/** classnames 헬퍼. tailwind-merge 없이 가볍게. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
