import { jest } from "@jest/globals";
import { connectDB, disconnectDB, getDB } from "../db/connection.js";
import { clearDatabase } from "./utils/clearDatabase.js";

jest.setTimeout(20000);

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearDatabase(getDB());
});

afterAll(async () => {
  await disconnectDB();
});