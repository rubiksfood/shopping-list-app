import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "CHANGE-ME"; // REMEMBER TO CHANGE THIS IN PRODUCTION!

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId; // string
    return next();
    
  } catch (err) {
  if (process.env.NODE_ENV !== "test") {
    console.error("Auth error:", err);
  }
  return res.status(401).json({ message: "Invalid or expired token" });}
}