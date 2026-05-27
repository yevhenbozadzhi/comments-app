import { getComments } from "../services/getComments.js";
import { getReplies } from "../services/getReplies.js";
import { createComment } from "../services/createComment.js";
import { deleteComment } from "../services/deleteComment.js";
import { getCaptcha, verifyCaptcha } from "../services/getCaptcha.js";
import { uploadFile } from "../services/uploadService.js";
import { sanitizeHtmlService } from "../services/SanitizeService.js";
import { createCommentSchema } from "../validation/validation.js";
import { getIO } from "../socket.js";
import { previewCommentService } from "../services/previewComment.js";
export const getCommentsController = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const result = await getComments(page, sortBy, sortOrder);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRepliesController = async (req, res) => {
  try {
    const { id } = req.params;
    const replies = await getReplies(id);
    res.status(200).json(replies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCommentController = async (req, res) => {
  try {
    const body = createCommentSchema.parse({
      username: req.body.username,
      email: req.body.email,
      homepage: req.body.homepage ?? null,
      client_meta: req.body.client_meta ?? null,
      text: sanitizeHtmlService(req.body.text),
      parentId: req.body.parentId ?? null,
      captchaSessionId: req.body.captchaSessionId,
      captcha: req.body.captcha,
    });
    const captcha = verifyCaptcha(req.body.captchaSessionId, req.body.captcha);
    if (!captcha) {
      return res.status(400).json({ message: "Invalid captcha" });
    }
    const result = await createComment(body);
    getIO().emit("newComment", result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await deleteComment(id);
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCaptchaController = async (req, res) => {
  const captcha = getCaptcha();
  res.status(200).json(captcha);
};

export const uploadFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { id } = req.params;
    const file = req.file;

    const attachment = await uploadFile(file, id);
    res.status(200).json(attachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReplyController = async (req, res) => {
  try {
    req.body.parentId = req.params.id;
    return createCommentController(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const previewCommentController = async (req, res) => {
  try {
    const result = await previewCommentService(
      req.body.text,
      req.body.username,
      req.body.email,
      req.body.homepage,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
