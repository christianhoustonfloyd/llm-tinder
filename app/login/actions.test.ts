import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth so we don't pull in Next.js server internals at test time.
// loginAction imports AuthError from the same (mocked) module, so `instanceof`
// against this class behaves exactly as it does in production.
vi.mock("next-auth", () => {
  class AuthError extends Error {}
  return { AuthError };
});
vi.mock("@/lib/auth", () => ({ signIn: vi.fn() }));

import { AuthError } from "next-auth";
import { loginAction } from "./actions";
import { signIn } from "@/lib/auth";

const mockSignIn = signIn as unknown as ReturnType<typeof vi.fn>;

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loginAction", () => {
  it("returns a friendly error when credentials are rejected (AuthError)", async () => {
    mockSignIn.mockRejectedValue(new AuthError("bad creds"));

    const result = await loginAction(null, form({ email: "a@b.com", password: "secret" }));

    expect(result).toEqual({ error: "Invalid email or password." });
  });

  it("re-throws non-AuthError errors (e.g. the success redirect) so Next can handle them", async () => {
    const redirectError = new Error("NEXT_REDIRECT");
    mockSignIn.mockRejectedValue(redirectError);

    await expect(
      loginAction(null, form({ email: "a@b.com", password: "secret" }))
    ).rejects.toThrow("NEXT_REDIRECT");
  });

  it("forwards the submitted credentials and redirect target to signIn", async () => {
    mockSignIn.mockResolvedValue(undefined);

    await loginAction(null, form({ email: "user@example.com", password: "hunter2" }));

    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "hunter2",
      redirectTo: "/swipe",
    });
  });
});
