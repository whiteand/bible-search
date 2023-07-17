import { BibleModuleId } from "./types.ts";

export function getBibleModuleKey(
  bibleModuleId: BibleModuleId
): ["bibleModule", BibleModuleId] {
  return ["bibleModule", bibleModuleId];
}
export function getBibleModuleIdKey(
  bibleModuleId: BibleModuleId
): ["bibleModule", BibleModuleId, "id"] {
  return [...getBibleModuleKey(bibleModuleId), "id"];
}
export function getBibleModuleInfoKey(
  bibleModuleId: BibleModuleId
): ["bibleModule", BibleModuleId, "info"] {
  return [...getBibleModuleKey(bibleModuleId), "info"];
}
export function getBibleModuleInfoItemKey<N extends string = string>(
  bibleModuleId: BibleModuleId,
  name: N
): ["bibleModule", BibleModuleId, "info", N] {
  return [...getBibleModuleInfoKey(bibleModuleId), name];
}
