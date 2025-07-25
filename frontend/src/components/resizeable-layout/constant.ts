export type FeatureButtonId = "comparison-details" | "cv-analyzer" | "chatbot";

interface FeatureButton {
  id: FeatureButtonId;
  label: string;
  iconUrl?: string;
}

export const FEATURE_BUTTONS: FeatureButton[] = [
  { id: "comparison-details", label: "Target Country" },
  { id: "cv-analyzer", label: "Magic Analyzer" },
  { id: "chatbot", label: "Bonbon AI", iconUrl: "/BONBON_HIHI.svg" },
];