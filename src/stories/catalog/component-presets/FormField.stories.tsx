import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PresetDocBanner } from "./PresetDocBanner";

const fieldTypeOptions = ["text", "tel", "email", "select", "checkbox"] as const;
export type FormFieldPresetFieldType = (typeof fieldTypeOptions)[number];

export type FormFieldPresetArgs = {
  label: string;
  placeholder: string;
  fieldType: FormFieldPresetFieldType;
};

function FormFieldPresetPreview({ label, placeholder, fieldType }: FormFieldPresetArgs) {
  return (
    <div className="max-w-md bg-white p-4">
      <PresetDocBanner id="form-field" />
      <div className="rounded-ods-12 border border-ods-border bg-white p-5">
        <div className="mb-3">
          <div className="mb-1 text-ods-caption text-ods-text-secondary">{label}</div>
          {fieldType === "checkbox" ? (
            <label className="flex items-center gap-2 text-ods-body-md text-ods-text-primary">
              <input className="size-4 rounded border-ods-border" type="checkbox" />
              <span>{placeholder || "동의합니다"}</span>
            </label>
          ) : fieldType === "select" ? (
            <select
              className="h-10 w-full rounded-ods-8 border border-ods-border bg-white px-3 text-ods-body-md text-ods-text-primary"
              defaultValue=""
            >
              <option disabled value="">
                {placeholder}
              </option>
              <option>옵션 1</option>
              <option>옵션 2</option>
            </select>
          ) : (
          <div
            className="h-10 rounded-ods-8 border border-ods-border bg-white px-3 leading-10 text-ods-body-md text-ods-text-tertiary"
          >
              {placeholder}
            </div>
          )}
        </div>
        <p className="text-ods-caption text-ods-text-tertiary">
          fieldType: <code className="font-mono text-ods-primary">{fieldType}</code>
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Catalog/Component presets/Form field",
  component: FormFieldPresetPreview,
  tags: ["autodocs"],
  args: {
    label: "이름",
    placeholder: "홍길동",
    fieldType: "text",
  } satisfies FormFieldPresetArgs,
  argTypes: {
    label: { control: "text", table: { category: "Props" } },
    placeholder: { control: "text", table: { category: "Props" } },
    fieldType: {
      description: "uiSpec.fieldType enum",
      options: [...fieldTypeOptions],
      control: { type: "inline-radio" },
      table: { category: "Props" },
    },
  },
  parameters: {
    layout: "padded",
    controls: { sort: "requiredFirst" as const },
    docs: {
      description: {
        component:
          "`COMPONENT_PRESETS['form-field']` — `fieldType` 은 select/radio 형 Controls 로 고정 옵션만 선택합니다.",
      },
    },
  },
} satisfies Meta<typeof FormFieldPresetPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
