import sanitizeHtml from "sanitize-html";
export const sanitizeHtmlService = (html) => {
  return sanitizeHtml(html, {
    allowedTags: ["a", "code", "i", "strong"],
    allowedAttributes: {
      a: ["href"],
      code: ["class"],
      i: [],
      strong: [],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
    },
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: true,
    enforceHtmlBoundary: true,
  });
};
