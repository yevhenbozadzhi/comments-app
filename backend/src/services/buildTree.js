export const buildTree = (comments) => {
  try {
    const map = new Map();
    const roots = [];
    for (const comment of comments) {
      map.set(comment.id, { ...comment, replies: [] });
    }
    for (const comment of comments) {
      const root = map.get(comment.id);
      if (comment.parentId === null) {
        roots.push(root);
      } else {
        map.get(comment.parentId).replies.push(root);
      }
    }
    return roots;
  } catch {
    throw new Error("Failed to build tree");
  }
};
