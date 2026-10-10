import Bookmark from "../models/Bookmark.js";
import User from "../models/User.js";

const DAY = 24 * 60 * 60 * 1000;
const TZ = "Asia/Dhaka";
const dayKey = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);

export async function getStats(req, res) {
  const now = Date.now();

  // অ্যাডমিনদের কোনো তথ্য এই উত্তরে আসবে না, তাই তাদের id আগে আলাদা করি
  const adminIds = await User.distinct("_id", { role: "admin" });
  const member = { role: "user" };

  const [
    totalUsers,
    newUsers7,
    totalBookmarks,
    withLastRead,
    perUser,
    byDay,
    recent,
  ] = await Promise.all([
    User.countDocuments(member),
    User.countDocuments({ ...member, createdAt: { $gte: new Date(now - 7 * DAY) } }),
    Bookmark.countDocuments({ user: { $nin: adminIds } }),
    User.countDocuments({ ...member, "lastRead.quran.surah": { $exists: true } }),
    Bookmark.aggregate([
      { $match: { user: { $nin: adminIds } } },
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { ...member, createdAt: { $gte: new Date(now - 15 * DAY) } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    User.find(member).sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  // গত ১৪ দিন, যে দিনে কেউ আসেনি সেদিনও ০ দিয়ে
  const counts = new Map(byDay.map((d) => [d._id, d.count]));
  const signups = Array.from({ length: 14 }, (_, i) => {
    const date = dayKey(new Date(now - (13 - i) * DAY));
    return { date, count: counts.get(date) || 0 };
  });

  const marks = new Map(perUser.map((p) => [String(p._id), p.count]));
  const users = recent.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    bookmarks: marks.get(String(u._id)) || 0,
    lastRead: u.lastRead?.quran?.surah
      ? { surah: u.lastRead.quran.surah, ayah: u.lastRead.quran.ayah }
      : null,
  }));

  return res.json({
    totals: {
      users: totalUsers,
      newUsers7,
      bookmarks: totalBookmarks,
      usersWithBookmarks: perUser.length,
      usersWithLastRead: withLastRead,
    },
    signups,
    users,
  });
}