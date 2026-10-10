import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
        role: { type: String, enum: ["user", "admin"], default: "user" },
    lastRead: {
      quran: {
        surah: { type: Number, min: 1, max: 114 },
        ayah: { type: Number, min: 1, max: 286 },
        updatedAt: { type: Date },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);