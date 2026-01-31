/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: {},
  setupFiles: ["<rootDir>/tests/dotenv.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};