export const FEATURE_BUTTONS = [
  {
    id: "comparison-details",
    label: "Comparison Details",
  },
  {
    id: "cv-analyzer",
    label: "CV Analyzer",
  }
] as const;

export type FeatureButtonId = "comparison-details" | "cv-analyzer";

