import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDeck, recordSwipe, getMatches } from "@/lib/swipes";

// Mock the Prisma singleton — the data layer is unit-tested with no real DB.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    swipe: { findMany: vi.fn(), upsert: vi.fn() },
    aiModel: { findMany: vi.fn() },
  },
}));

// Import the mocked module to reach the vi.fn() spies with proper typing.
import { prisma } from "@/lib/prisma";
const mockPrisma = prisma as unknown as {
  swipe: { findMany: ReturnType<typeof vi.fn>; upsert: ReturnType<typeof vi.fn> };
  aiModel: { findMany: ReturnType<typeof vi.fn> };
};

// A raw Prisma AiModel row (with included features) as the data layer expects it.
function rawModel(overrides: Record<string, unknown> = {}) {
  return {
    id: "model-1",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    tagline: "Frontier reasoning",
    description: "A very capable model.",
    imageUrl: null,
    contextWindow: 200000,
    inputPricePerMTok: 15,
    outputPricePerMTok: 75,
    releaseDate: new Date("2026-01-15T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    features: [
      { value: "yes", feature: { name: "Vision", category: "multimodal" } },
      { value: null, feature: { name: "Tool use", category: null } },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDeck", () => {
  it("excludes models the user has already swiped on", async () => {
    mockPrisma.swipe.findMany.mockResolvedValue([
      { aiModelId: "seen-a" },
      { aiModelId: "seen-b" },
    ]);
    mockPrisma.aiModel.findMany.mockResolvedValue([rawModel()]);

    await getDeck("user-1");

    expect(mockPrisma.aiModel.findMany).toHaveBeenCalledTimes(1);
    const arg = mockPrisma.aiModel.findMany.mock.calls[0][0];
    expect(arg.where).toMatchObject({
      isActive: true,
      id: { notIn: ["seen-a", "seen-b"] },
    });
  });

  it("returns an empty exclusion list when the user has no swipes", async () => {
    mockPrisma.swipe.findMany.mockResolvedValue([]);
    mockPrisma.aiModel.findMany.mockResolvedValue([]);

    const deck = await getDeck("user-1");

    expect(deck).toEqual([]);
    expect(mockPrisma.aiModel.findMany.mock.calls[0][0].where.id.notIn).toEqual([]);
  });

  it("maps a Prisma row to a serializable DTO (Date → ISO, flattened features)", async () => {
    mockPrisma.swipe.findMany.mockResolvedValue([]);
    mockPrisma.aiModel.findMany.mockResolvedValue([rawModel()]);

    const [card] = await getDeck("user-1");

    expect(card.releaseDate).toBe("2026-01-15T00:00:00.000Z");
    expect(typeof card.releaseDate).toBe("string");
    expect(card.features).toEqual([
      { name: "Vision", category: "multimodal", value: "yes" },
      { name: "Tool use", category: null, value: null },
    ]);
    // The internal createdAt must not leak into the DTO.
    expect(card).not.toHaveProperty("createdAt");
  });

  it("keeps releaseDate null when the model has none", async () => {
    mockPrisma.swipe.findMany.mockResolvedValue([]);
    mockPrisma.aiModel.findMany.mockResolvedValue([rawModel({ releaseDate: null })]);

    const [card] = await getDeck("user-1");

    expect(card.releaseDate).toBeNull();
  });
});

describe("recordSwipe", () => {
  it("upserts on the composite (userId, aiModelId) key", async () => {
    mockPrisma.swipe.upsert.mockResolvedValue({});

    await recordSwipe("user-1", "model-1", "RIGHT");

    expect(mockPrisma.swipe.upsert).toHaveBeenCalledWith({
      where: { userId_aiModelId: { userId: "user-1", aiModelId: "model-1" } },
      update: { direction: "RIGHT" },
      create: { userId: "user-1", aiModelId: "model-1", direction: "RIGHT" },
    });
  });

  it("passes a LEFT direction through unchanged", async () => {
    mockPrisma.swipe.upsert.mockResolvedValue({});

    await recordSwipe("user-1", "model-1", "LEFT");

    const arg = mockPrisma.swipe.upsert.mock.calls[0][0];
    expect(arg.update.direction).toBe("LEFT");
    expect(arg.create.direction).toBe("LEFT");
  });
});

describe("getMatches", () => {
  it("queries only RIGHT swipes for the user", async () => {
    mockPrisma.swipe.findMany.mockResolvedValue([]);

    await getMatches("user-1");

    const arg = mockPrisma.swipe.findMany.mock.calls[0][0];
    expect(arg.where).toMatchObject({ userId: "user-1", direction: "RIGHT" });
  });

  it("maps each swipe to { swipedAt (ISO), model (DTO) }", async () => {
    mockPrisma.swipe.findMany.mockResolvedValue([
      { createdAt: new Date("2026-02-01T12:00:00.000Z"), aiModel: rawModel() },
    ]);

    const matches = await getMatches("user-1");

    expect(matches).toHaveLength(1);
    expect(matches[0].swipedAt).toBe("2026-02-01T12:00:00.000Z");
    expect(matches[0].model.id).toBe("model-1");
    expect(matches[0].model.features[0].name).toBe("Vision");
  });
});
