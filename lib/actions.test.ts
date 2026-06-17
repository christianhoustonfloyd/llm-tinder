import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/swipes", () => ({ recordSwipe: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { swipeAction } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { recordSwipe } from "@/lib/swipes";
import { revalidatePath } from "next/cache";

const mockAuth = auth as unknown as ReturnType<typeof vi.fn>;
const mockRecordSwipe = recordSwipe as unknown as ReturnType<typeof vi.fn>;
const mockRevalidate = revalidatePath as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("swipeAction", () => {
  it("throws and records nothing when there is no session", async () => {
    mockAuth.mockResolvedValue(null);

    await expect(swipeAction("model-1", "RIGHT")).rejects.toThrow("Not authenticated");
    expect(mockRecordSwipe).not.toHaveBeenCalled();
  });

  it("throws when the session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: {} });

    await expect(swipeAction("model-1", "RIGHT")).rejects.toThrow("Not authenticated");
    expect(mockRecordSwipe).not.toHaveBeenCalled();
  });

  it("records the swipe with the SERVER-trusted userId (never a client value)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "server-user" } });
    mockRecordSwipe.mockResolvedValue({});

    await swipeAction("model-1", "RIGHT");

    // The userId comes from the session, not from any argument.
    expect(mockRecordSwipe).toHaveBeenCalledWith("server-user", "model-1", "RIGHT");
  });

  it("revalidates both the deck and matches pages after recording", async () => {
    mockAuth.mockResolvedValue({ user: { id: "server-user" } });
    mockRecordSwipe.mockResolvedValue({});

    await swipeAction("model-1", "LEFT");

    expect(mockRevalidate).toHaveBeenCalledWith("/swipe");
    expect(mockRevalidate).toHaveBeenCalledWith("/matches");
  });
});
