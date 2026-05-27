import { sanitizeHtmlService } from "./SanitizeService.js";
export const previewCommentService = async (
  text,
  username,
  email,
  homepage,
) => {
  try {
    const body = {
      text: sanitizeHtmlService(text),
      username: username,
      email: email,
      homepage: homepage ?? null,
    };
    return {
      html: `<p>${body.text}</p><p>Username: ${body.username}</p><p>Email: ${body.email}</p><p>Homepage: ${body.homepage ?? null}</p>`,
    };
  } catch (error) {
    throw new Error("Failed to preview comment");
  }
};
