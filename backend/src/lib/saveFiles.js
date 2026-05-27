import sharp from "sharp";
import prisma from "../prisma.js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const IMAGE_DIR = path.join(UPLOAD_ROOT, "images");
const TEXT_DIR = path.join(UPLOAD_ROOT, "text");

const MAX_TEXT_SIZE = 100 * 1024;

export function validateFile(file) {
  if (!file) {
    throw new Error("File is required");
  }

  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    return "IMAGE";
  }

  if (file.mimetype === "text/plain") {
    return "TEXT";
  }

  throw new Error("Invalid file type");
}

export async function saveImage(file) {
  await fs.mkdir(IMAGE_DIR, { recursive: true });

  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const fullPath = path.join(IMAGE_DIR, filename);

  await sharp(file.buffer).resize(320, 240, { fit: "inside" }).toFile(fullPath);

  return {
    path: `/uploads/images/${filename}`,
    originalName: file.originalname,
  };
}

export async function saveText(file) {
  if (file.size > MAX_TEXT_SIZE) {
    throw new Error("Text file size exceeds 100KB");
  }

  await fs.mkdir(TEXT_DIR, { recursive: true });

  const filename = `${crypto.randomUUID()}.txt`;
  const fullPath = path.join(TEXT_DIR, filename);

  await fs.writeFile(fullPath, file.buffer);

  return {
    path: `/uploads/text/${filename}`,
    originalName: file.originalname,
  };
}

export async function createAttachmentRecord(
  commentId,
  type,
  filePath,
  originalName,
) {
  return prisma.attachment.create({
    data: {
      commentId,
      type,
      path: filePath,
      originalName,
    },
  });
}
