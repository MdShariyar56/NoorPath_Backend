
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

try {
  await connectDB();
} catch (err) {
  console.error("Could not connect to MongoDB:", err.message);
  console.error(
    "Check your MongoDB connection string, Atlas Network Access, and internet connection."
  );
  process.exit(1);
}

const PORT = process.env.PORT || env.port;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});
