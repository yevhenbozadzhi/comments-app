import prisma from "../prisma.js";
export const deleteComment = async (id) => {
  try {
    const res = await prisma.comment.delete({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            homepage: true,
          },
        },
      },
    });
    return res;
  } catch {
    throw new Error("Failed to delete comment");
  }
};
