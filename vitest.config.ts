import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root,
  resolve: {
    alias: {
      "@repo/config": fileURLToPath(new URL("./packages/config/src/index.ts", import.meta.url)),
      "@repo/core": fileURLToPath(new URL("./packages/core/src/index.ts", import.meta.url)),
      "@repo/fee-optimizer": fileURLToPath(new URL("./packages/fee-optimizer/src/index.ts", import.meta.url)),
      "@repo/logger": fileURLToPath(new URL("./packages/logger/src/index.ts", import.meta.url)),
      "@repo/retry-engine": fileURLToPath(new URL("./packages/retry-engine/src/index.ts", import.meta.url)),
      "@repo/router": fileURLToPath(new URL("./packages/router/src/index.ts", import.meta.url)),
      "@repo/rpc-client": fileURLToPath(new URL("./packages/rpc-client/src/index.ts", import.meta.url)),
      "@repo/simulator": fileURLToPath(new URL("./packages/simulator/src/index.ts", import.meta.url)),
      "@repo/tx-builder": fileURLToPath(new URL("./packages/tx-builder/src/index.ts", import.meta.url)),
      "@repo/types": fileURLToPath(new URL("./packages/types/src/index.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: [
      "packages/*/src/**/*.test.ts",
      "apps/*/src/**/*.test.ts",
      "tests/**/*.test.ts",
    ],
    exclude: ["**/dist/**", "**/.next/**", "**/node_modules/**"],
    hookTimeout: 10_000,
    testTimeout: 10_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: `${root}coverage`,
      include: [
        "packages/config/src/**/*.ts",
        "packages/core/src/**/*.ts",
        "packages/fee-optimizer/src/**/*.ts",
        "packages/logger/src/**/*.ts",
        "packages/retry-engine/src/**/*.ts",
        "packages/router/src/**/*.ts",
        "packages/rpc-client/src/**/*.ts",
        "packages/sdk/src/**/*.ts",
        "packages/simulator/src/**/*.ts",
        "packages/tx-builder/src/**/*.ts",
        "packages/types/src/**/*.ts",
      ],
      exclude: ["**/*.test.ts", "**/*.d.ts", "**/index.ts"],
    },
  },
});
