/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
  },
  coverageDirectory: "coverage",
  coverageReporters: ["html", "text", "lcov", "json"],
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts"],
  coverageThreshold: {
    global: {
      statements: 81.5,
      branches: 80,
      functions: 82,
      lines: 87,
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
