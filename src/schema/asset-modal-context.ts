import type { CardSlotName } from "./card";

/** `openAssetModal` / 프리뷰 에셋 클릭 시 공통 컨텍스트 */
export interface AssetSlotModalOpenContext {
  sectionId: string;
  componentId: string | null;
  slotName: string;
  cellId?: string;
  cardSlotName?: CardSlotName;
}
