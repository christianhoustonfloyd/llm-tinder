"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/lib/auth";
import { recordSwipe } from "@/lib/swipes";
import type { SwipeDirection } from "@/lib/types";

/**
 * Record a swipe for the *currently authenticated* user. The userId is taken
 * from the session on the server — never trusted from the client.
 */
export async function swipeAction(aiModelId: string, direction: SwipeDirection) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await recordSwipe(session.user.id, aiModelId, direction);
  revalidatePath("/swipe");
  revalidatePath("/matches");
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/swipe" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
