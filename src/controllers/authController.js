import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { clearAuthCookie, setAuthCookie, signToken } from "../utils/token.js";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ইউজার না থাকলেও একই সময় লাগানোর জন্য নকল হ্যাশ
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password-1", 12);

export async function register(req, res) {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2 || cleanName.length > 60) {
    return res.status(400).json({ message: "Name must be 2 to 60 characters" });
  }
  if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 254) {
    return res.status(400).json({ message: "Enter a valid email address" });
  }
  if (
    password.length < 8 ||
    password.length > 128 ||
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return res.status(400).json({
      message: "Password must be 8 to 128 characters with a letter and a number",
    });
  }

  const exists = await User.exists({ email: cleanEmail });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hash,
    });

    return res.status(201).json({
      message: "Account created",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    throw err;
  }
}

export async function login(req, res) {
  const { email, password, remember } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const invalid = () =>
    res.status(401).json({ message: "Incorrect email or password" });

  if (
    !EMAIL_RE.test(cleanEmail) ||
    cleanEmail.length > 254 ||
    password.length === 0 ||
    password.length > 128
  ) {
    return invalid();
  }

  // password ঘর নিজে থেকে আসে না, তাই .select("+password") দিয়ে চেয়ে আনি
  const user = await User.findOne({ email: cleanEmail }).select("+password");
  const match = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !match) return invalid();

  const token = signToken(user._id);
  setAuthCookie(res, token, remember !== false);

  return res.json({
    message: "Logged in",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export function me(req, res) {
  const u = req.user;
  return res.json({
    user: { id: u._id, name: u.name, email: u.email, role: u.role },
  });
}

export function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Logged out" });
}