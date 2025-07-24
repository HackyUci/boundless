export const FEATURE_BUTTONS = [
  {
    id: "country-details",
    label: "Country Details",
  },
  {
    id: "cv-analyzer",
    label: "CV Analyzer",
  }
] as const;

export type FeatureButtonId = "country-details" | "cv-analyzer";

