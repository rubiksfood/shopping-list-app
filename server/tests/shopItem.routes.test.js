import app from "../app.js";
import { ObjectId } from "mongodb";
import request from "supertest";

import { connectDB, disconnectDB, getDB } from "../db/connection.js";
import { clearDatabase } from "./utils/clearDatabase.js";

// Helper function to register and login a user, returning the auth token
async function registerAndLogin(email = "user@example.com") {
  await request(app)
    .post("/auth/register")
    .send({ email, password: "password123" });

  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email, password: "password123" });

  return loginRes.body.token;
}

describe("ShopItem routes", () => {
  let token;

    beforeEach(async () => {
      token = await registerAndLogin();
    });

  // LIST

  // TCON-ITEM-LIST-01: Empty list when no items
  it("returns empty list when there are no items", async () => {
    const res = await request(app)
      .get("/shopItem")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  // TCON-ITEM-LIST-02: List returns only the current user’s items
  it("returns only items for current user", async () => {
    // Create item for user A
    await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Oat drink",
        amount: "2",
        notes: "Barista edition",
        isChecked: false,
      });

    // Create item for user B
    const otherToken = await registerAndLogin("other@example.com");
    await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Spelt flour",
        amount: "1",
        notes: "",
        isChecked: false,
      });

    const res = await request(app)
      .get("/shopItem")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Oat drink");
    expect(res.body[0]).toHaveProperty("userId");
  });

  // CREATE

  // TCON-ITEM-CREATE-01: Valid create item
  it("creates an item for the user", async () => {
    const res = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Oat drink",
        amount: "2",
        notes: "Barista edition",
        isChecked: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("insertedId");
    expect(res.body).toHaveProperty("acknowledged", true);
  });

  // TCON-ITEM-CREATE-02: Invalid/missing fields
  it("should reject item creation with empty \"name\" field, but is currently accepted (known gap)", async () => {
    // Backend does NOT enforce validation; this test documents current behaviour.
    const res = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${token}`)
      .send({}); // no fields

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("insertedId");
    expect(res.body).toHaveProperty("acknowledged", true);
  });

  // GET BY ID

  // TCON-ITEM-GET-01: Get own item by valid ID
  it("returns an owned item by valid ID", async () => {
    const createRes = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Eggs",
        amount: "10",
        notes: "",
        isChecked: false,
      });

    const id = createRes.body.insertedId;

    const res = await request(app)
      .get(`/shopItem/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", id);
    expect(res.body).toHaveProperty("name", "Eggs");
    expect(res.body).toHaveProperty("userId");
  });

  // TCON-ITEM-GET-02: Get non-existent item
  it("returns 404 for non-existent item", async () => {
    const nonExistentId = new ObjectId().toHexString();

    const res = await request(app)
      .get(`/shopItem/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    // backend sends plain text "Not found"
    expect(res.text).toBe("Not found");
  });

  // TCON-ITEM-GET-03: Get another user’s item
  it("returns 404 for another user's item", async () => {
    // Create item as other user (User B)
    const otherToken = await registerAndLogin("other@example.com");
    const createRes = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Spelt flour",
        amount: "1",
        notes: "",
        isChecked: false,
      });

    const otherUsersItemId = createRes.body.insertedId;

    // Try to fetch as original user (User A)
    const res = await request(app)
      .get(`/shopItem/${otherUsersItemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe("Not found");
  });

  // UPDATE

  // TCON-ITEM-UPDATE-01: Update own item
  it("updates item when owned by user", async () => {
    const createRes = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Eggs",
        amount: "10",
        notes: "",
        isChecked: false,
      });

    const id = createRes.body.insertedId;

    const res = await request(app)
      .patch(`/shopItem/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isChecked: true });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", id);
    expect(res.body).toHaveProperty("isChecked", true);
  });

  // TCON-ITEM-UPDATE-02: Update non-existent item
  it("returns 404 when item does not exist", async () => {
    const nonExistentId = new ObjectId().toHexString();

    const res = await request(app)
      .patch(`/shopItem/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isChecked: true });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe("Item not found");
  });

  // TCON-ITEM-UPDATE-03: Update another user’s item
  it("returns 404 when updating another user's item", async () => {
    // Create item as other user (User B)
    const otherToken = await registerAndLogin("other@example.com");
    const createRes = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Feta",
        amount: "1",
        notes: "",
        isChecked: false,
      });

    const otherUsersItemId = createRes.body.insertedId;

    // Try to update as original user (User A)
    const res = await request(app)
      .patch(`/shopItem/${otherUsersItemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isChecked: true });

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe("Item not found");
  });

  // DELETE

  // TCON-ITEM-DELETE-01: Delete own item
  it("deletes an owned item", async () => {
    const createRes = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Feta",
        amount: "1",
        notes: "",
        isChecked: false,
      });

    const id = createRes.body.insertedId;

    const res = await request(app)
      .delete(`/shopItem/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("deletedCount", 1);
  });

  // TCON-ITEM-DELETE-02: Delete non-existent item
  it("returns 404 for non-existent item", async () => {
    const nonExistentId = new ObjectId().toHexString();

    const res = await request(app)
      .delete(`/shopItem/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe("Item not found");
  });

  // TCON-ITEM-DELETE-03: Delete another user’s item
  it("returns 404 when deleting another user's item", async () => {
    // Create item as other user (User B)
    const otherToken = await registerAndLogin("other@example.com");
    const createRes = await request(app)
      .post("/shopItem")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        name: "Oat drink",
        amount: "2",
        notes: "Barista edition",
        isChecked: false,
      });

    const otherUsersItemId = createRes.body.insertedId;

    // Try to delete as original user (User A)
    const res = await request(app)
      .delete(`/shopItem/${otherUsersItemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.text).toBe("Item not found");
  });
});