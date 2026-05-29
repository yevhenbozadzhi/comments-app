import prisma from "../prisma.js";
export const getReplies = async (parentId) => {
  try {
    const res = await prisma.comment.findMany({
      where: {
        parentId: parentId,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            homepage: true,
          },
        },
        attachment: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return res;
  } catch {
    throw new Error("Failed to get replies");
  }
};
