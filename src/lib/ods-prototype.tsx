/**
 * ODS Prototype 컴포넌트 — `./prototype-ods` (Bucketplace 사내 prototype-ods 패키지)
 * 의 로컬 어댑터. 사내 패키지가 public npm 에 없어 직접 설치 불가하므로,
 * 카탈로그(github.com/bucketplace/product-design/blob/main/mcp-servers/
 * ods-prototype-mcp-server/src/catalog/components.json) 기준으로 동일한 props
 * 시그니처를 가진 어댑터를 제공한다.
 *
 * 사내 패키지가 사용 가능해지면 아래 한 줄을 교체:
 *
 *   import { TopNavigation, BottomNavigation, ScreenShell } from "./prototype-ods";
 */

"use client";

import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// TopNavigation — left / center / right 슬롯 + centerWidth
// ---------------------------------------------------------------------------

interface TopNavigationProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** 기본 "rigid" — center 가 고정 폭. "fluid" 면 양옆 컨텐츠 폭 만큼 양보. */
  centerWidth?: "rigid" | "fluid";
}

interface TopNavigationIconButtonProps {
  icon: React.ComponentType<{ size?: number | string }>;
  "aria-label": string;
  onClick?: () => void;
}

function TopNavigationIconButton({
  icon: Icon,
  onClick,
  ...rest
}: TopNavigationIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest["aria-label"]}
      className="flex h-10 w-10 items-center justify-center rounded-full text-ods-text-primary hover:bg-ods-surface-light"
    >
      <Icon size={24} />
    </button>
  );
}

export function TopNavigation({ left, center, right, centerWidth = "rigid" }: TopNavigationProps) {
  return (
    <header
      data-ods-component="TopNavigation"
      className="flex h-14 w-full items-center bg-white px-4 md:px-10"
    >
      <div className="flex min-w-[40px] items-center gap-1">{left}</div>
      <div
        className={
          centerWidth === "fluid"
            ? "flex flex-1 items-center justify-center px-3 text-[15px] font-semibold text-ods-text-primary"
            : "flex w-[200px] items-center justify-center px-3 text-[15px] font-semibold text-ods-text-primary"
        }
      >
        {center}
      </div>
      <div className="ml-auto flex min-w-[40px] items-center justify-end gap-1">{right}</div>
    </header>
  );
}
TopNavigation.IconButton = TopNavigationIconButton;

// ---------------------------------------------------------------------------
// BottomNavigation — 5개 탭 패턴
// ---------------------------------------------------------------------------

interface BottomNavItem {
  key: string;
  label: ReactNode;
  icon: ReactNode;
  activeIcon?: ReactNode;
  badge?: ReactNode;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  activeKey: string;
  onChange?: (key: string) => void;
}

export function BottomNavigation({ items, activeKey, onChange }: BottomNavigationProps) {
  return (
    <nav
      data-ods-component="BottomNavigation"
      className="flex w-full items-center justify-around border-t border-ods-border bg-white py-2"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange?.(item.key)}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px]"
          >
            <span className={active ? "text-ods-text-primary" : "text-ods-text-tertiary"}>
              {active && item.activeIcon ? item.activeIcon : item.icon}
            </span>
            <span className={active ? "text-ods-text-primary" : "text-ods-text-tertiary"}>
              {item.label}
            </span>
            {item.badge ? (
              <span className="absolute right-[calc(50%-18px)] top-0">{item.badge}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
