import request from "supertest";
import app from "../app.js";
import { connectDB, disconnectDB, getDB } from "../db/connection.js";
import { clearDatabase } from "./utils/clearDatabase.js";

describe("Auth routes", () => {

  // TCON-AUTH-REG-01: Valid registration
  describe("POST /auth/register", () => {
    it("creates a user with a valid email and password", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "pass123" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "User created");
    });

    // TCON-AUTH-REG-02: Missing fields in registration
    it("rejects missing fields", async () => {
      const res = await request(app)
      .post("/auth/register")
      .send({});

      expect(res.statusCode).toBe(400);
    });

    // TCON-AUTH-REG-03: Duplicate registration
    it("rejects duplicate email", async () => {
      // First registration
      await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "pass123" });

      // Second registration
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", password: "pass123" });

      expect(res.statusCode).toBe(409);
    });
  });

  // TCON-AUTH-LOG-01: Valid login
  describe("POST /auth/login", () => {
    it("returns token for valid credentials", async () => {
      // Create user
      await request(app)
        .post("/auth/register")
        .send({ email: "login@example.com", password: "Pass1234" });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "login@example.com", password: "Pass1234" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    // TCON-AUTH-LOG-02: Login with wrong password
    it("rejects invalid password", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "login@example.com", password: "wrong" });

      expect(res.statusCode).toBe(401);
    });

    // TCON-AUTH-LOG-03: Login with unknown email
    it("rejects unknown email", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "unknown@example.com", password: "wrong" });

      expect(res.statusCode).toBe(401);
    });

    // TCON-AUTH-LOG-04: Login fails with missing fields
    it("rejects missing fields", async () => {
      const emailRes = await request(app)
        .post("/auth/login")
        .send({ email: "login@example.com" });

      expect(emailRes.statusCode).toBe(401);

      const emptyRes = await request(app)
        .post("/auth/login")
        .send({});

      expect(emptyRes.statusCode).toBe(401);
    });
  });

  // TCON-AUTH-ME-01: /auth/me with valid token
  describe("GET /auth/me", () => {
    it("returns user info for a valid token", async () => {
      const registerRes = await request(app)
        .post("/auth/register")
        .send({ email: "me@example.com", password: "secret123" });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "me@example.com", password: "secret123" });

      const token = loginRes.body.token;

      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("email", "me@example.com");
      expect(res.body).not.toHaveProperty("passwordHash");
    });

    // TCON-AUTH-ME-02: /auth/me without token
    it("rejects requests without a token", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.statusCode).toBe(401);
    });
  });
});