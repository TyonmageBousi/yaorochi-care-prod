import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/test/setup/polyfills.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "app/api/**/*.ts",
    "lib/services/**/*.ts",
    "lib/validations/**/*.ts",
    "!**/*.d.ts",
  ],
};

export default createJestConfig(config);
