import Bookmark from "../models/Bookmark.js";
import User from "../models/User.js";

const MAX_BOOKMARKS = 500;
const HADITH_BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"];

// কুরআন: "সূরা:আয়াত", যেমন "2:255"
function validQuran(target) {
  const m = /^(\d{1,3}):(\d{1,3})$/.exec(target);
  if (!m) return false;
  const surah = Number(m[1]);
  const ayah = Number(m[2]);
  return surah >= 1 && surah <= 114 && ayah >= 1 && ayah <= 286;
}

// হাদিস: "গ্রন্থ:অধ্যায়:হাদিস নম্বর", যেমন "bukhari:1:5"
function validHadith(target) {
  const m = /^([a-z]+):(\d{1,3}):(\d{1,5}(?:\.\d{1,3})?)$/.exec(target);
  return !!m && HADITH_BOOKS.includes(m[1]);
}

// দুয়া: "ক্যাটাগরি:সেকশন:দুয়ার id", যেমন "travel:12:345"
function validDua(target) {
  return /^[A-Za-z0-9_-]{1,60}:\d{1,5}:\d{1,5}$/.test(target);
}

const VALIDATORS = { quran: validQuran, hadith: validHadith, dua: validDua };
const isType = (t) => typeof t === "string" && Object.hasOwn(VALIDATORS, t);

const present = (b) => ({
  id: b._id,
  type: b.type,
  target: b.target,
  label: b.label || "",
  createdAt: b.createdAt,
});

export async function listBookmarks(req, res) {
  const filter = { user: req.user._id };
  if (isType(req.query.type)) filter.type = req.query.type;

  const list = await Bookmark.find(filter).sort({ createdAt: -1 }).limit(MAX_BOOKMARKS);
  return res.json({ bookmarks: list.map(present) });
}

export async function addBookmark(req, res) {
  const { type, target, label } = req.body ?? {};

  if (!isType(type) || typeof target !== "string" || !VALIDATORS[type](target)) {
    return res.status(400).json({ message: "Invalid bookmark" });
  }

  const cleanLabel = typeof label === "string" ? label.trim().slice(0, 140) : "";
  const filter = { user: req.user._id, type, target };

  const existing = await Bookmark.findOne(filter);
  if (existing) return res.json({ bookmark: present(existing) });

  const count = await Bookmark.countDocuments({ user: req.user._id });
  if (count >= MAX_BOOKMARKS) {
    return res.status(400).json({ message: "Bookmark limit reached" });
  }

  try {
    const created = await Bookmark.create({ ...filter, label: cleanLabel });
    return res.status(201).json({ bookmark: present(created) });
  } catch (err) {
    // একই সময়ে দুইবার চাপলে ডাটাবেস নিজেই আটকায়
    if (err.code === 11000) {
      const again = await Bookmark.findOne(filter);
      return res.json({ bookmark: present(again) });
    }
    throw err;
  }
}

export async function removeBookmark(req, res) {
  const { type, target } = req.query;

  if (!isType(type) || typeof target !== "string") {
    return res.status(400).json({ message: "Invalid bookmark" });
  }

  await Bookmark.deleteOne({ user: req.user._id, type, target });
  return res.json({ message: "Removed" });
}

export function getLastRead(req, res) {
  const q = req.user.lastRead?.quran;
  return res.json({
    lastRead: q?.surah
      ? { surah: q.surah, ayah: q.ayah, updatedAt: q.updatedAt }
      : null,
  });
}

export async function setLastRead(req, res) {
  const { surah, ayah } = req.body ?? {};

  if (
    !Number.isInteger(surah) ||
    !Number.isInteger(ayah) ||
    surah < 1 ||
    surah > 114 ||
    ayah < 1 ||
    ayah > 286
  ) {
    return res.status(400).json({ message: "Invalid position" });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $set: { "lastRead.quran": { surah, ayah, updatedAt: new Date() } } }
  );

  return res.json({ lastRead: { surah, ayah } });
}