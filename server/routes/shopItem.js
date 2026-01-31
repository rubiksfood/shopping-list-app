import express from "express";

// This helps to connect to the database
import { getDB } from "../db/connection.js";

// This helps to convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";

import auth from "../middleware/auth.js";

// This router is added as middleware and takes control of requests starting with path /item.
const router = express.Router();

// Get a list of all items, EXCLUSIVELY for the current user. 
router.get("/", auth, async (req, res) => {
  try {
    const db = getDB();
    const collection = await db.collection("shopItems");
    // Ensure that items ONLY belong to the logged in user
    const results = await collection
      .find({ userId: req.userId })
      .toArray();

    res.status(200).send(results);
  } catch (err) {
    console.error("Get items error:", err);
    res.status(500).send("Error getting items");
  }
});

// Get a single item by id, but ONLY if it belongs to this user
router.get("/:id", auth, async (req, res) => {
  try {
    const db = getDB();
    const collection = await db.collection("shopItems");
    const query = {
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    };

    const result = await collection.findOne(query);

    if (!result) {
      res.status(404).send("Not found");
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    console.error("Get item error:", err);
    res.status(500).send("Error getting item");
  }
});

// Create a new item, ONLY for the current user
router.post("/", auth, async (req, res) => {
  try {
    const newDocument = {
      name: req.body.name,
      amount: req.body.amount,
      notes: req.body.notes,
      isChecked: req.body.isChecked,
      userId: req.userId, // <- associate with user
      createdAt: new Date(),
    };

    const db = getDB();
    const collection = await db.collection("shopItems");
    const result = await collection.insertOne(newDocument);
    res.status(201).send(result);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Error adding item");
  }
});

// Update an item, ONLY if it belongs to this user
router.patch("/:id", auth, async (req, res) => {
  try {
    const query = {
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    };

    const updates = {
      $set: req.body,
      // This only updates the fields provided in the request body.
    };

    const db = getDB();
    const collection = await db.collection("shopItems");
    const result = await collection.updateOne(query, updates);

    if (result.matchedCount === 0) {
      res.status(404).send("Item not found");
      return;
    }

    // Fetch the updated item
    const updatedItem = await collection.findOne(query);
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).send("Error updating item");
  }
});

// Delete an item, ONLY if it belongs to the current user
router.delete("/:id", auth, async (req, res) => {
  try {
    const query = {
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    };

    const db = getDB();
    const collection = await db.collection("shopItems");
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      res.status(404).send("Item not found");
      return;
    }

    res.status(200).send({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Error deleting item");
  }
});

export default router;