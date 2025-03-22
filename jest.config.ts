import nextJest from "next/jest";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: ".env.test" });

const createJestConfig = nextJest({
  dir: "./", // Point to your Next.js root directory
});

const customJestConfig = {
  testMatch: ["**/api/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  setupFiles: ["./jest.setup.ts"], // Ensure that the setup file is executed before tests
  moduleNameMapper: {
    // Adjust this path mapping to your project structure
    "^@/(.*)$": "<rootDir>/src/$1", // This maps the '@' alias to the 'src' directory
  },
};

export default createJestConfig(customJestConfig);
