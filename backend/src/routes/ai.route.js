import express from "express";
import { clothify } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/clothify", protectRoute, clothify);

export default router;
