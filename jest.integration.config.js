const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */

const config = {
  displayName: "integration",
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/integration/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^server-only$": "<rootDir>/test/integration/mocks/server-only.ts",
  },
  testTimeout: 30000,
};

module.exports = createJestConfig(config);