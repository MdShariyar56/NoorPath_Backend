import { Router } from "express";
import { getStats } from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

// এই ফাইলের সব ঠিকানায় লগইন করা অ্যাডমিন লাগবে
router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);

export default router;