"use client";

/**
 * 검수 모달.
 * - [검수] 버튼 클릭 시 열린다.
 * - 실제 구현에서는 Jira 디자인/개발 티켓 자동 생성 + Slack 채널 메시지 발송.
 * - 1차 골격: 폼만 노출하고, "보내기" 시 console.log + 토스트 시뮬레이션.
 */

import { useState } from "react";

import { validateProps } from "@/lib/validate";
import { COMPONENT_PRESETS } from "@/schema/component-presets";
import { SECTION_PRESETS } from "@/schema/section-presets";
import { useBuilderStore } from "@/store/builder-store";

export default function ReviewModal() {
  const open = useBuilderStore((s) => s.reviewModalOpen);
  const close = useBuilderStore((s) => s.closeReviewModal);
  const doc = useBuilderStore((s) => s.doc);

  const [createDesignTicket, setCreateDesignTicket] = useState(true);
  const [createDevTicket, setCreateDevTicket] = useState(true);
  const [sendSlack, setSendSlack] = useState(true);
  const [slackChannel, setSlackChannel] = useState("#landing-review");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  // 검증 — 모든 섹션/컴포넌트의 UI Spec 위반 카운트
  const violations: { sectionName: string; field: string; message: string }[] = [];
  for (const section of doc.sections) {
    const sectionSpec = SECTION_PRESETS[section.preset].uiSpec;
    for (const err of validateProps(section.props, sectionSpec)) {
      violations.push({
        sectionName: section.name,
        field: err.field,
        message: err.message,
      });
    }
    for (const [, list] of Object.entries(section.slots)) {
      for (const c of list) {
        const cSpec = COMPONENT_PRESETS[c.preset].uiSpec;
        for (const err of validateProps(c.props, cSpec)) {
          violations.push({
            sectionName: `${section.name} > ${COMPONENT_PRESETS[c.preset].label}`,
            field: err.field,
            message: err.message,
          });
        }
      }
    }
  }

  const canSubmit = violations.length === 0 && !sending;

  const handleSubmit = async () => {
    setSending(true);
    // 시뮬레이션: 실제로는 Jira/Slack MCP 커넥터 호출
    const payload = {
      page: { slug: doc.meta.slug, title: doc.meta.title },
      owners: doc.meta.owners,
      jira: {
        design: createDesignTicket,
        dev: createDevTicket,
      },
      slack: sendSlack ? { channel: slackChannel } : null,
      memo,
    };
    // eslint-disable-next-line no-console
    console.log("[Review submit]", payload);
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    close();
    alert("검수 요청을 보냈습니다 (시뮬레이션)");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[560px] max-w-full rounded-ods-12 border border-builder-border bg-builder-panel"
      >
        <div className="flex items-center justify-between border-b border-builder-border px-5 py-3">
          <div>
            <div className="text-sm font-semibold">검수 요청</div>
            <div className="text-[11px] text-builder-muted">
              Jira 티켓 자동 생성 · Slack 채널 발송
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="text-builder-muted hover:text-builder-text"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-5 text-[12px]">
          {/* UI Spec 검증 결과 */}
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
              UI Spec 검증
            </div>
            {violations.length === 0 ? (
              <div className="rounded-ods-8 border border-builder-success/30 bg-builder-success/10 px-3 py-2 text-builder-success">
                ✓ 모든 섹션이 스펙을 만족합니다 ({doc.sections.length}개 섹션)
              </div>
            ) : (
              <div className="rounded-ods-8 border border-builder-danger/40 bg-builder-danger/10 p-2">
                <div className="mb-1 font-medium text-builder-danger">
                  {violations.length}개의 위반이 있습니다 — 수정 후 다시 시도하세요
                </div>
                <ul className="space-y-0.5 text-[11px] text-builder-text">
                  {violations.slice(0, 8).map((v, i) => (
                    <li key={i}>
                      <span className="text-builder-muted">{v.sectionName}</span> ·{" "}
                      <span className="text-builder-danger">{v.field}</span>:{" "}
                      {v.message}
                    </li>
                  ))}
                  {violations.length > 8 && (
                    <li className="text-builder-muted">
                      ... 외 {violations.length - 8}건
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* 담당자 */}
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
              담당자
            </div>
            <div className="space-y-1 rounded-ods-8 border border-builder-border bg-builder-bg p-2 text-[11px]">
              <div>
                <span className="text-builder-muted">Designer:</span>{" "}
                {doc.meta.owners.designer?.name ?? "—"}
              </div>
              <div>
                <span className="text-builder-muted">Developer:</span>{" "}
                {doc.meta.owners.developer?.name ?? "—"}
              </div>
              <div>
                <span className="text-builder-muted">PM:</span>{" "}
                {doc.meta.owners.pm?.name ?? "—"}
              </div>
            </div>
          </div>

          {/* 옵션 */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createDesignTicket}
                onChange={(e) => setCreateDesignTicket(e.target.checked)}
              />
              <span>Jira 디자인 검수 티켓 생성</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createDevTicket}
                onChange={(e) => setCreateDevTicket(e.target.checked)}
              />
              <span>Jira 개발 검수 티켓 생성</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendSlack}
                onChange={(e) => setSendSlack(e.target.checked)}
              />
              <span>Slack 채널 발송</span>
              {sendSlack && (
                <input
                  type="text"
                  value={slackChannel}
                  onChange={(e) => setSlackChannel(e.target.value)}
                  className="ml-2 flex-1 rounded-ods-4 border border-builder-border bg-builder-bg px-2 py-1 text-[11px]"
                />
              )}
            </label>
          </div>

          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-builder-muted">
              메모 (선택)
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              placeholder="검수자에게 전달할 컨텍스트…"
              className="w-full resize-none rounded-ods-8 border border-builder-border bg-builder-bg px-2 py-1.5 text-[12px] outline-none focus:border-builder-accent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-builder-border px-5 py-3">
          <button
            type="button"
            onClick={close}
            className="rounded-ods-8 border border-builder-border px-3 py-1.5 text-[12px] hover:border-builder-accent"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="rounded-ods-8 bg-builder-success px-3 py-1.5 text-[12px] font-medium text-black hover:bg-builder-success/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "전송 중..." : "검수 요청 보내기"}
          </button>
        </div>
      </div>
    </div>
  );
}
