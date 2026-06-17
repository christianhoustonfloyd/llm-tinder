import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(), create: vi.fn() } },
}));
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed-pw") },
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { registerAction } from "./actions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const mockPrisma = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
};
const mockHash = bcrypt.hash as unknown as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("registerAction validation", () => {
  it("rejects an invalid email and touches no database", async () => {
    const result = await registerAction(null, form({ email: "not-an-email", password: "secret1" }));

    expect(result).toEqual({
      error: "Enter a valid email and a password of 6+ characters.",
    });
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 6 characters", async () => {
    const result = await registerAction(null, form({ email: "a@b.com", password: "short" }));

    expect(result).toEqual({
      error: "Enter a valid email and a password of 6+ characters.",
    });
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});

describe("registerAction account creation", () => {
  it("blocks signup when the email is already taken", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

    const result = await registerAction(null, form({ email: "taken@b.com", password: "secret1" }));

    expect(result).toEqual({ error: "An account with that email already exists." });
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("hashes the password, creates the user, and redirects on success", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-user" });

    await registerAction(null, form({ name: "Ada", email: "ada@b.com", password: "secret1" }));

    expect(mockHash).toHaveBeenCalledWith("secret1", 10);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { email: "ada@b.com", name: "Ada", passwordHash: "hashed-pw" },
    });
    expect(mockRedirect).toHaveBeenCalledWith("/login?registered=1");
  });

  it("stores name as null when omitted", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: "new-user" });

    await registerAction(null, form({ email: "noname@b.com", password: "secret1" }));

    expect(mockPrisma.user.create.mock.calls[0][0].data.name).toBeNull();
  });
});
