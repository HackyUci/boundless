export const FEATURE_BUTTONS = [
  {
    id: "comparison-details",
    label: "Comparison Details",
  },
  {
    id: "cv-analyzer",
    label: "CV Analyzer",
  },
  {
    id: "chatbot",
    label: "Chatbot",
  },

] as const;

export type FeatureButtonId = "comparison-details" | "cv-analyzer" | "chatbot";

