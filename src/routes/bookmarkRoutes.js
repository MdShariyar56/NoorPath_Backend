import { Router } from "express";
import {
  addBookmark,
  getLastRead,
  listBookmarks,
  removeBookmark,
  setLastRead,
} from "../controllers/bookmarkController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// এই ফাইলের সব ঠিকানায় লগইন লাগবে
router.use(requireAuth);

router.get("/bookmarks", listBookmarks);
router.post("/bookmarks", addBookmark);
router.delete("/bookmarks", removeBookmark);

router.get("/last-read", getLastRead);
router.put("/last-read", setLastRead);

export default router;