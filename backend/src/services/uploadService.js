import {
  validateFile,
  saveImage,
  saveText,
  createAttachmentRecord,
} from "../lib/saveFiles.js";

export async function uploadFile(file, commentId) {
  try {
    let saved;
    const type = validateFile(file);
    if (type === "IMAGE") {
      saved = await saveImage(file);
    } else if (type === "TEXT") {
      saved = await saveText(file);
    }
    const attachment = await createAttachmentRecord(
      commentId,
      type,
      saved.path,
      saved.originalName,
    );
    return attachment;
  } catch (error) {
    throw new Error("Failed to upload file");
  }
}
