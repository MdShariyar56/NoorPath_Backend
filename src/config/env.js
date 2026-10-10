import "dotenv/config";

const required = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error(`Missing environment variables in .env: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET is too short. Use at least 32 characters.");
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  isProd: process.env.NODE_ENV === "production",
};