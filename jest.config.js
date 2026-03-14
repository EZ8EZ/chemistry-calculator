/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
};
