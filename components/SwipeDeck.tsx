"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import type { ModelCardData, SwipeDirection } from "@/lib/types";
import { swipeAction } from "@/lib/actions";
import ModelCard from "./ModelCard";
import SwipeButtons from "./SwipeButtons";

export default function SwipeDeck({ models }: { models: ModelCardData[] }) {
  const [queue, setQueue] = useState(models);
  const [, startTransition] = useTransition();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const nopeOpacity = useTransform(x, [-130, -30], [1, 0]);

  const top = queue[0];
  const next = queue[1];

  function commit(direction: SwipeDirection) {
    if (!top) return;
    const id = top.id;
    // Optimistically remove the top card; persist in the background.
    setQueue((q) => q.slice(1));
    x.set(0);
    startTransition(() => {
      void swipeAction(id, direction);
    });
  }

  function fling(direction: SwipeDirection) {
    animate(x, direction === "RIGHT" ? 600 : -600, {
      duration: 0.3,
      onComplete: () => commit(direction),
    });
  }

  if (!top) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="text-xl font-semibold">You&apos;ve seen every model</h2>
        <p className="max-w-xs text-sm text-neutral-500">
          Check your matches, or come back when new models are added.
        </p>
        <Link
          href="/matches"
          className="rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white hover:bg-rose-600"
        >
          View matches
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="relative h-[30rem]">
        {/* Card behind, for a stacked feel */}
        {next && (
          <div className="absolute inset-0 scale-[0.96] opacity-60">
            <ModelCard model={next} />
          </div>
        )}

        <motion.div
          key={top.id}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x > 120) fling("RIGHT");
            else if (info.offset.x < -120) fling("LEFT");
            else animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
          }}
        >
          <ModelCard model={top} />

          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-5 top-5 rotate-[-15deg] rounded-lg border-4 border-green-500 px-3 py-1 text-2xl font-extrabold uppercase text-green-500"
          >
            Match
          </motion.div>
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="pointer-events-none absolute right-5 top-5 rotate-[15deg] rounded-lg border-4 border-red-500 px-3 py-1 text-2xl font-extrabold uppercase text-red-500"
          >
            Nope
          </motion.div>
        </motion.div>
      </div>

      <SwipeButtons onNope={() => fling("LEFT")} onLike={() => fling("RIGHT")} />
    </div>
  );
}
