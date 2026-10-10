import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

try {
  await connectDB();
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  console.error(
    "Check: (1) the connection string and password in .env, " +
      "(2) Atlas Network Access allows your current IP, (3) your internet connection."
  );
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});