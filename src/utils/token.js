import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const COOKIE_NAME = "noorpath_token";
const DAYS = 7;

export function signToken(userId) {
  return jwt.sign({ id: String(userId) }, env.jwtSecret, {
    expiresIn: `${DAYS}d`,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

const baseOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "lax",
  path: "/",
};

// remember = true হলে ৭ দিন থাকবে, নইলে ব্রাউজার বন্ধ করলেই চলে যাবে
export function setAuthCookie(res, token, remember = true) {
  res.cookie(COOKIE_NAME, token, {
    ...baseOptions,
    ...(remember ? { maxAge: DAYS * 24 * 60 * 60 * 1000 } : {}),
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, baseOptions);
}