import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["quran", "hadith", "dua"], required: true },
    target: { type: String, required: true, trim: true, maxlength: 80 },
    // তালিকায় দেখানোর নাম, যেমন "Sahih al-Bukhari · Hadith 5"
    label: { type: String, trim: true, maxlength: 140, default: "" },
  },
  { timestamps: true }
);

// একই ইউজার একই জিনিস দুবার বুকমার্ক করতে পারবে না
bookmarkSchema.index({ user: 1, type: 1, target: 1 }, { unique: true });

export default mongoose.model("Bookmark", bookmarkSchema);