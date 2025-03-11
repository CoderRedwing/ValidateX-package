export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true // Ensures Jest handles TypeScript as an ES module
      }
    ],
    "^.+\\.jsx?$": "babel-jest",
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text", "lcov"],
  transformIgnorePatterns: [
    "/node_modules/(?!your-esm-package)" // Ensures Jest transforms ESM dependencies if needed
  ]
};
