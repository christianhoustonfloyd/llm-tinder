export type SwipeDirection = "LEFT" | "RIGHT";

export type ModelFeature = {
  name: string;
  category: string | null;
  value: string | null;
};

// Plain, serializable shape passed from server components to client components.
export type ModelCardData = {
  id: string;
  name: string;
  provider: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  contextWindow: number | null;
  inputPricePerMTok: number | null;
  outputPricePerMTok: number | null;
  releaseDate: string | null;
  features: ModelFeature[];
};

export type MatchData = {
  swipedAt: string;
  model: ModelCardData;
};
