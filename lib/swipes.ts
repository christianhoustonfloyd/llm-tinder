import { prisma } from "@/lib/prisma";
import type { ModelCardData, MatchData, SwipeDirection } from "@/lib/types";

// Prisma's AiModel + included features → the serializable DTO our UI uses.
type ModelWithFeatures = {
  id: string;
  name: string;
  provider: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  contextWindow: number | null;
  inputPricePerMTok: number | null;
  outputPricePerMTok: number | null;
  releaseDate: Date | null;
  features: { value: string | null; feature: { name: string; category: string | null } }[];
};

function toModelCardData(m: ModelWithFeatures): ModelCardData {
  return {
    id: m.id,
    name: m.name,
    provider: m.provider,
    tagline: m.tagline,
    description: m.description,
    imageUrl: m.imageUrl,
    contextWindow: m.contextWindow,
    inputPricePerMTok: m.inputPricePerMTok,
    outputPricePerMTok: m.outputPricePerMTok,
    releaseDate: m.releaseDate ? m.releaseDate.toISOString() : null,
    features: m.features.map((f) => ({
      name: f.feature.name,
      category: f.feature.category,
      value: f.value,
    })),
  };
}

const includeFeatures = {
  features: { include: { feature: true }, orderBy: { feature: { name: "asc" } } },
} as const;

/** Active models the user has NOT yet swiped on (left or right). */
export async function getDeck(userId: string): Promise<ModelCardData[]> {
  const swiped = await prisma.swipe.findMany({
    where: { userId },
    select: { aiModelId: true },
  });
  const excluded = swiped.map((s) => s.aiModelId);

  const models = await prisma.aiModel.findMany({
    where: { isActive: true, id: { notIn: excluded } },
    include: includeFeatures,
    orderBy: { createdAt: "asc" },
  });
  return models.map(toModelCardData);
}

/** Record (or update) a swipe. One row per user/model thanks to the unique key. */
export async function recordSwipe(
  userId: string,
  aiModelId: string,
  direction: SwipeDirection
) {
  return prisma.swipe.upsert({
    where: { userId_aiModelId: { userId, aiModelId } },
    update: { direction },
    create: { userId, aiModelId, direction },
  });
}

/** A match = a RIGHT swipe. */
export async function getMatches(userId: string): Promise<MatchData[]> {
  const swipes = await prisma.swipe.findMany({
    where: { userId, direction: "RIGHT" },
    include: { aiModel: { include: includeFeatures } },
    orderBy: { createdAt: "desc" },
  });
  return swipes.map((s) => ({
    swipedAt: s.createdAt.toISOString(),
    model: toModelCardData(s.aiModel),
  }));
}
