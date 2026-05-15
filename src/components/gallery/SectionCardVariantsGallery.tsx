import Card from "@/components/preview/Card";
import Section from "@/components/preview/Section";
import {
  carouselLayout,
  fixtureByPreset,
  gridLayout,
  rowLayout,
} from "@/components/preview/sections/__fixtures__/sectionFixtures";
import type { CardProps, CardUsagePresetId } from "@/schema/card";
import { CARD_USAGE_PRESETS } from "@/schema/card";
import type { Section as SectionData } from "@/schema/doc";
import { SECTION_PRESETS, type SectionPresetId } from "@/schema/section-presets";

const presetOrder = Object.keys(SECTION_PRESETS) as SectionPresetId[];

function cardPropsFromSection(section: SectionData): CardProps | null {
  const inst = section.slots.content?.[0];
  if (!inst || inst.preset !== "card") return null;
  return inst.props as unknown as CardProps;
}

const usageFixture: Record<CardUsagePresetId, SectionData> = {
  usp: fixtureByPreset.usp,
  review: fixtureByPreset.review,
  step: fixtureByPreset.process,
  service: fixtureByPreset["cross-sell"],
  custom: fixtureByPreset.usp,
};

function SectionPresetBlock({ id }: { id: SectionPresetId }) {
  const preset = SECTION_PRESETS[id];
  return (
    <article className="border-b border-ods-border-light py-8 last:border-b-0">
      <header className="mb-4 max-w-3xl space-y-1 px-4">
        <p className="text-ods-caption font-medium uppercase tracking-wide text-ods-text-tertiary">
          {preset.category} · {preset.defaultLocked ? "locked" : "editable"}
        </p>
        <h2 className="text-xl font-semibold text-ods-text-primary">{preset.label}</h2>
        <p className="text-ods-body-md text-ods-text-secondary">{preset.description}</p>
        <code className="text-ods-caption text-ods-primary">preset: &quot;{id}&quot;</code>
      </header>
      <div className="w-full overflow-x-auto">
        <Section section={fixtureByPreset[id]} viewport="desktop" />
      </div>
    </article>
  );
}

/**
 * 섹션 전 프리셋 + Card 의 usage / layout 변형을 한 스크롤 페이지로 묶습니다.
 * Storybook 갤러리 스토리와 `/gallery/section-card-variants` 가 공유합니다.
 */
export default function SectionCardVariantsGallery() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ods-border bg-ods-surface-light px-4 py-8">
        <div className="mx-auto max-w-[1280px] space-y-2">
          <p className="text-ods-caption font-medium uppercase tracking-wide text-ods-text-tertiary">
            Component-driven gallery
          </p>
          <h1 className="text-2xl font-bold text-ods-text-primary">Section &amp; Card variants</h1>
          <p className="max-w-2xl text-ods-body-md text-ods-text-secondary">
            Storybook 튜토리얼의 CSF3 스토리처럼, 프리셋별 상태를 한 화면에서 나열해 독립적으로 검토할 수
            있습니다. 아래는 <code className="font-mono text-ods-primary">section-presets</code> 전체와{" "}
            <code className="font-mono text-ods-primary">Card</code> 의 usage·layout 조합입니다.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] border-b border-ods-border py-4">
        <h2 className="px-4 pb-2 text-lg font-semibold text-ods-text-primary">Sections — 모든 프리셋</h2>
        {presetOrder.map((id) => (
          <SectionPresetBlock key={id} id={id} />
        ))}
      </section>

      <section className="mx-auto max-w-[1280px] space-y-12 px-4 py-10">
        <div>
          <h2 className="text-lg font-semibold text-ods-text-primary">Card — usage 패턴</h2>
          <p className="mt-1 text-ods-body-md text-ods-text-secondary">
            동일한 fixture 셀에 <code className="font-mono text-ods-primary">usage</code> 만 바꿔 렌더 차이를
            봅니다.
          </p>
        </div>
        <div className="space-y-8">
          {(Object.keys(CARD_USAGE_PRESETS) as CardUsagePresetId[]).map((usage) => {
            const usageMeta = CARD_USAGE_PRESETS[usage];
            const base = cardPropsFromSection(usageFixture[usage]);
            if (!base) return null;
            const data: CardProps =
              usage === "custom"
                ? { ...base, usage: "custom", layout: gridLayout }
                : { ...base, usage };
            return (
              <section key={usage} className="rounded-ods-12 border border-ods-border p-4">
                <h3 className="mb-1 font-semibold text-ods-text-primary">{usageMeta.label}</h3>
                <p className="mb-4 text-ods-body-sm text-ods-text-secondary">{usageMeta.description}</p>
                <code className="mb-3 block text-ods-caption text-ods-text-tertiary">
                  usage: &quot;{usage}&quot;
                </code>
                <Card {...data} viewport="desktop" />
              </section>
            );
          })}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-ods-text-primary">Card — layout 변형 (USP 셀)</h2>
          <p className="mt-1 text-ods-body-md text-ods-text-secondary">
            같은 USP 데이터로 <code className="font-mono text-ods-primary">grid</code> /{" "}
            <code className="font-mono text-ods-primary">carousel</code> /{" "}
            <code className="font-mono text-ods-primary">row</code> 만 교체합니다.
          </p>
        </div>
        <div className="space-y-8">
          {(
            [
              ["grid", gridLayout],
              ["carousel", carouselLayout],
              ["row", rowLayout],
            ] as const
          ).map(([label, layout]) => {
            const base = cardPropsFromSection(fixtureByPreset.usp);
            if (!base) return null;
            const data: CardProps = { ...base, usage: "usp", layout };
            return (
              <section key={label} className="rounded-ods-12 border border-ods-border p-4">
                <h3 className="mb-3 font-semibold capitalize text-ods-text-primary">{label}</h3>
                <code className="mb-3 block text-ods-caption text-ods-text-tertiary">
                  layout.type: &quot;{label}&quot;
                </code>
                <Card {...data} viewport="desktop" />
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
