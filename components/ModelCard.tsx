import type { ModelCardData } from "@/lib/types";

const PROVIDER_GRADIENTS: Record<string, string> = {
  Anthropic: "from-orange-400 to-rose-500",
  OpenAI: "from-emerald-400 to-teal-600",
  Google: "from-sky-400 to-indigo-600",
  "Meta": "from-blue-500 to-violet-600",
  "Mistral": "from-amber-400 to-orange-600",
  "xAI": "from-neutral-700 to-neutral-900",
};

function gradient(provider: string) {
  return PROVIDER_GRADIENTS[provider] ?? "from-fuchsia-400 to-rose-500";
}

export default function ModelCard({ model }: { model: ModelCardData }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-neutral-900">
      <div
        className={`relative flex h-44 shrink-0 items-end bg-gradient-to-br ${gradient(
          model.provider
        )} p-5`}
      >
        <div className="text-white">
          <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold backdrop-blur">
            {model.provider}
          </span>
          <h2 className="mt-2 text-2xl font-bold drop-shadow">{model.name}</h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
        {model.tagline && (
          <p className="text-sm font-medium text-rose-500">{model.tagline}</p>
        )}
        {model.description && (
          <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {model.description}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          {model.contextWindow != null && (
            <Stat
              label="Context"
              value={`${(model.contextWindow / 1000).toLocaleString()}K tokens`}
            />
          )}
          {model.inputPricePerMTok != null && (
            <Stat label="Input" value={`$${model.inputPricePerMTok}/M`} />
          )}
          {model.outputPricePerMTok != null && (
            <Stat label="Output" value={`$${model.outputPricePerMTok}/M`} />
          )}
        </dl>

        {model.features.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {model.features.map((f) => (
              <span
                key={f.name}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                {f.name}
                {f.value ? `: ${f.value}` : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
