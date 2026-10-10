import User from "../models/User.js";
import { COOKIE_NAME, verifyToken } from "../utils/token.js";

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: "Not logged in" });

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ message: "Not logged in" });
  }

  const user = await User.findById(payload.id);
  if (!user) return res.status(401).json({ message: "Not logged in" });

  req.user = user;
  next();
}

// অ্যাডমিন না হলে ঠিকানাটা "নেই" বলে দেখাই
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(404).json({ message: "Not found" });
  }
  next();
}