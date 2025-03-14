import nextJest from "next/jest";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({path: ".env.test"});

const createJestConfig = nextJest({
  dir: "./", // Point to your Next.js root directory
});

const customJestConfig = {
  testMatch: ["**/api/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  setupFiles: ["./jest.setup.ts"], // Ensure that the setup file is executed before tests
};

export default createJestConfig(customJestConfig);
