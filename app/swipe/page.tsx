import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDeck } from "@/lib/swipes";
import SwipeDeck from "@/components/SwipeDeck";

export default async function SwipePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const models = await getDeck(session.user.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <SwipeDeck models={models} />
    </main>
  );
}
