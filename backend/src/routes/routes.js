import express from "express";
import { getCommentsController } from "../controllers/controllers.js";
import { getRepliesController } from "../controllers/controllers.js";
import { createCommentController } from "../controllers/controllers.js";
import { deleteCommentController } from "../controllers/controllers.js";
import { getCaptchaController } from "../controllers/controllers.js";
import { uploadMiddleware } from "../middleware/upload.js";
import { uploadFileController } from "../controllers/controllers.js";
import {
  registerController,
  meCommentController,
} from "../controllers/auth/auth.js";
import { loginController } from "../controllers/auth/auth.js";
import { createReplyController } from "../controllers/controllers.js";
import { previewCommentController } from "../controllers/controllers.js";
import { loginMiddleware } from "../middleware/auth/login.js";
import { authMiddleware } from "../middleware/auth/auth.js";
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meCommentController);

router.get("/comments", getCommentsController);
router.get("/comments/:id/replies", getRepliesController);
router.post("/comments", loginMiddleware, createCommentController);
router.get("/captcha", getCaptchaController);
router.delete("/comments/:id", deleteCommentController);
router.post(
  "/comments/:id/attachments",
  uploadMiddleware,
  uploadFileController,
);
router.post("/comments/:id/reply", loginMiddleware, createReplyController);
router.post("/comments/preview", previewCommentController);
export default router;
