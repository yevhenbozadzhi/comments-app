const ALLOWED_TAG = /<\/?(?:a|code|i|strong)\b[^>]*>/gi;

export function hasDisallowedHtml(text) {
  const stripped = text.replace(ALLOWED_TAG, "");
  return /<[^>]+>/.test(stripped);
}
