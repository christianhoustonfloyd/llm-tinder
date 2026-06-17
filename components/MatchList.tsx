import type { MatchData } from "@/lib/types";

export default function MatchList({ matches }: { matches: MatchData[] }) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <p className="text-5xl">💔</p>
        <h2 className="text-xl font-semibold">No matches yet</h2>
        <p className="text-sm text-neutral-500">Swipe right on a model to match with it.</p>
      </div>
    );
  }

  return (
    <ul className="mx-auto grid w-full max-w-2xl gap-3">
      {matches.map(({ model, swipedAt }) => (
        <li
          key={model.id}
          className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 text-lg font-bold text-white">
            {model.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {model.name}{" "}
              <span className="text-sm font-normal text-neutral-500">
                · {model.provider}
              </span>
            </p>
            {model.tagline && (
              <p className="truncate text-sm text-neutral-500">{model.tagline}</p>
            )}
          </div>
          <time className="shrink-0 text-xs text-neutral-400">
            {new Date(swipedAt).toLocaleDateString()}
          </time>
        </li>
      ))}
    </ul>
  );
}
