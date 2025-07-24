export const FEATURE_BUTTONS = [
  {
    id: "comparison-details",
    label: "Target Country",
  },
  {
    id: "cv-analyzer",
    label: "Magic Analyzer",
  },
  {
    id: "chatbot",
    label: "Bonbon AI",
  },

] as const;

export type FeatureButtonId = "comparison-details" | "cv-analyzer" | "chatbot";

