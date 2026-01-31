export async function clearDatabase(db) {
  if (!db) throw new Error("clearDatabase called without db instance");
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}