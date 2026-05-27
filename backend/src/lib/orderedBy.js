export function buildOrderBy(sortBy, sortOrder) {
  const direction = sortOrder === "asc" ? "asc" : "desc";
  if (sortBy === "username") return { user: { username: direction } };
  if (sortBy === "email") return { user: { email: direction } };
  return { createdAt: direction };
}
