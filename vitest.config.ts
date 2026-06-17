import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resolves the "@/*" path alias from tsconfig.json so tests import the same way app code does.
  resolve: { tsconfigPaths: true },
  test: {
    // Pure logic + server actions — no DOM needed (Prisma/auth are mocked).
    environment: "node",
    include: ["**/*.test.ts"],
    clearMocks: true,
  },
});
