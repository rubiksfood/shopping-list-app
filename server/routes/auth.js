import bcrypt from "bcryptjs";
import { getDB } from "../db/connection.js";
import express from "express";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import auth from "../middleware/auth.js";

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE-ME"; // REMEMBER TO CHANGE THIS IN PRODUCTION!

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const db = getDB();
    const usersCollection = await db.collection("users");

    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await usersCollection.insertOne({
      email,
      passwordHash,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = getDB();
    const usersCollection = await db.collection("users");
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /auth/me  (not necessary... but useful for frontend)
router.get("/me", auth, async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = await db.collection("users");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;