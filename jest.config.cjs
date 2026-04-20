module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "^@/integrations/supabase/client$": "<rootDir>/src/test/mocks/supabaseClient.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
