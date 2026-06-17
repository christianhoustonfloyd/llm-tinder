import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FEATURES = [
  { name: "Reasoning", category: "reasoning" },
  { name: "Coding", category: "coding" },
  { name: "Vision", category: "multimodal" },
  { name: "Long context", category: "context" },
  { name: "Fast", category: "speed" },
  { name: "Budget", category: "price" },
  { name: "Agentic", category: "agentic" },
  { name: "Open weights", category: "licensing" },
] as const;

type FeatureName = (typeof FEATURES)[number]["name"];

type ModelSeed = {
  id: string;
  name: string;
  provider: string;
  tagline: string;
  description: string;
  contextWindow: number;
  releaseDate: string;
  inputPricePerMTok: number;
  outputPricePerMTok: number;
  features: { name: FeatureName; value?: string }[];
};

const MODELS: ModelSeed[] = [
  {
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    tagline: "The deep thinker",
    description:
      "Anthropic's most capable model. Excels at hard reasoning, agentic coding, and long, careful work.",
    contextWindow: 200000,
    releaseDate: "2026-01-15",
    inputPricePerMTok: 15,
    outputPricePerMTok: 75,
    features: [
      { name: "Reasoning" },
      { name: "Coding" },
      { name: "Vision" },
      { name: "Agentic" },
      { name: "Long context", value: "200K" },
    ],
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    tagline: "Smart, balanced, dependable",
    description:
      "The everyday workhorse — near-frontier quality at a fraction of the cost and latency.",
    contextWindow: 200000,
    releaseDate: "2025-11-20",
    inputPricePerMTok: 3,
    outputPricePerMTok: 15,
    features: [
      { name: "Reasoning" },
      { name: "Coding" },
      { name: "Vision" },
      { name: "Agentic" },
      { name: "Long context", value: "200K" },
    ],
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    tagline: "Quick and thrifty",
    description:
      "Snappy and inexpensive for high-volume tasks, classification, and lightweight agents.",
    contextWindow: 200000,
    releaseDate: "2025-10-01",
    inputPricePerMTok: 1,
    outputPricePerMTok: 5,
    features: [
      { name: "Fast" },
      { name: "Budget" },
      { name: "Vision" },
      { name: "Long context", value: "200K" },
    ],
  },
  {
    id: "gpt-5-2",
    name: "GPT-5.2",
    provider: "OpenAI",
    tagline: "The all-rounder",
    description:
      "OpenAI's flagship, strong across reasoning, multimodal understanding, and tool use.",
    contextWindow: 400000,
    releaseDate: "2026-02-10",
    inputPricePerMTok: 10,
    outputPricePerMTok: 40,
    features: [
      { name: "Reasoning" },
      { name: "Coding" },
      { name: "Vision" },
      { name: "Agentic" },
      { name: "Long context", value: "400K" },
    ],
  },
  {
    id: "gpt-5-2-mini",
    name: "GPT-5.2 mini",
    provider: "OpenAI",
    tagline: "Lean and speedy",
    description:
      "A smaller, cheaper GPT-5.2 tuned for latency-sensitive and high-throughput workloads.",
    contextWindow: 400000,
    releaseDate: "2026-02-10",
    inputPricePerMTok: 0.6,
    outputPricePerMTok: 2.4,
    features: [{ name: "Fast" }, { name: "Budget" }, { name: "Vision" }],
  },
  {
    id: "gemini-3-pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    tagline: "Massive context, native multimodal",
    description:
      "Google's frontier model with an enormous context window and strong video and audio understanding.",
    contextWindow: 2000000,
    releaseDate: "2026-01-30",
    inputPricePerMTok: 7,
    outputPricePerMTok: 21,
    features: [
      { name: "Reasoning" },
      { name: "Vision" },
      { name: "Long context", value: "2M" },
      { name: "Agentic" },
    ],
  },
  {
    id: "gemini-3-flash",
    name: "Gemini 3 Flash",
    provider: "Google",
    tagline: "Big context on a budget",
    description:
      "Fast and economical, with a huge context window for document-heavy tasks.",
    contextWindow: 1000000,
    releaseDate: "2026-01-30",
    inputPricePerMTok: 0.3,
    outputPricePerMTok: 1.2,
    features: [
      { name: "Fast" },
      { name: "Budget" },
      { name: "Vision" },
      { name: "Long context", value: "1M" },
    ],
  },
  {
    id: "llama-4-405b",
    name: "Llama 4 405B",
    provider: "Meta",
    tagline: "Open weights, run it yourself",
    description:
      "Meta's open-weights flagship — fully self-hostable with strong general capabilities.",
    contextWindow: 256000,
    releaseDate: "2025-09-05",
    inputPricePerMTok: 0,
    outputPricePerMTok: 0,
    features: [
      { name: "Open weights" },
      { name: "Reasoning" },
      { name: "Coding" },
      { name: "Long context", value: "256K" },
    ],
  },
  {
    id: "mistral-large-3",
    name: "Mistral Large 3",
    provider: "Mistral",
    tagline: "European, efficient, open-ish",
    description:
      "A capable, efficient model with strong multilingual performance and permissive options.",
    contextWindow: 128000,
    releaseDate: "2025-12-12",
    inputPricePerMTok: 2,
    outputPricePerMTok: 6,
    features: [
      { name: "Coding" },
      { name: "Fast" },
      { name: "Open weights" },
    ],
  },
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "xAI",
    tagline: "Real-time and irreverent",
    description:
      "xAI's model with live information access and a distinctive conversational style.",
    contextWindow: 256000,
    releaseDate: "2025-12-01",
    inputPricePerMTok: 5,
    outputPricePerMTok: 15,
    features: [
      { name: "Reasoning" },
      { name: "Vision" },
      { name: "Agentic" },
      { name: "Long context", value: "256K" },
    ],
  },
];

async function main() {
  const featureByName = new Map<string, string>();
  for (const f of FEATURES) {
    const rec = await prisma.feature.upsert({
      where: { name: f.name },
      update: { category: f.category },
      create: { name: f.name, category: f.category },
    });
    featureByName.set(f.name, rec.id);
  }

  for (const m of MODELS) {
    const { features, releaseDate, ...rest } = m;
    const data = { ...rest, releaseDate: new Date(releaseDate) };
    await prisma.aiModel.upsert({
      where: { id: m.id },
      update: data,
      create: data,
    });

    for (const f of features) {
      const featureId = featureByName.get(f.name)!;
      await prisma.aiModelFeature.upsert({
        where: { aiModelId_featureId: { aiModelId: m.id, featureId } },
        update: { value: f.value ?? null },
        create: { aiModelId: m.id, featureId, value: f.value ?? null },
      });
    }
  }

  console.log(
    `Seeded ${MODELS.length} AI models and ${FEATURES.length} features.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
