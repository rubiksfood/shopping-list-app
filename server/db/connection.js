import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.ATLAS_URI || "";
if (!uri) throw new Error("ATLAS_URI is not defined");

let client;
let db;
let connectPromise = null;

export async function connectDB() {
  if (db) return db;

  // If a connection is already in progress, await it
  if (connectPromise) return await connectPromise;

  connectPromise = (async () => {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();

    const env = process.env.NODE_ENV;
    const dbName =
      process.env.DB_NAME ||
      (env === "test"
        ? "shopping-list-test"
        : env === "e2e"
        ? "shopping-list-test-e2e"
        : "shopping-list");

    db = client.db(dbName);
    return db;
  })();

  try {
    return await connectPromise;
  } finally {}
}

export async function disconnectDB() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
  connectPromise = null;
}

export function getDB() {
  if (!db) throw new Error("Database not initialised. Call connectDB() first.");
  return db;
}