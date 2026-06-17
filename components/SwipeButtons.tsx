"use client";

export default function SwipeButtons({
  onNope,
  onLike,
  disabled,
}: {
  onNope: () => void;
  onLike: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={onNope}
        disabled={disabled}
        aria-label="Pass"
        className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white text-2xl shadow-md transition hover:scale-105 hover:text-red-500 disabled:opacity-50 dark:border-white/15 dark:bg-neutral-800"
      >
        ✕
      </button>
      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        aria-label="Like"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-2xl text-white shadow-md transition hover:scale-105 hover:bg-rose-600 disabled:opacity-50"
      >
        ♥
      </button>
    </div>
  );
}
