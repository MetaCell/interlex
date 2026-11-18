import type { ResolvedRef } from "./types";

// What a value reads as on screen: its label, followed by the qualifier that says how it holds
// ("Trpv1 (Higher)").
export const refText = (ref: ResolvedRef): string => {
  const text = ref.label || ref.curie;
  return ref.qualifier ? `${text} (${refText(ref.qualifier)})` : text;
};
