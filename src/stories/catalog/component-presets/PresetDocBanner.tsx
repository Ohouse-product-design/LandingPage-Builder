import { COMPONENT_PRESETS, type ComponentPresetId } from "@/schema/component-presets";

export function PresetDocBanner({ id }: { id: ComponentPresetId }) {
  const p = COMPONENT_PRESETS[id];
  return (
    <header className="mb-4 space-y-1">
      <h3 className="text-lg font-semibold text-ods-text-primary">{p.label}</h3>
      <p className="text-ods-body-md text-ods-text-secondary">{p.description}</p>
      <code className="text-ods-caption text-ods-primary">preset: &quot;{id}&quot;</code>
    </header>
  );
}
