import prisma from "../prisma.js";
export const createComment = async (commentData) => {
  try {
    const user = await prisma.user.upsert({
      where: {
        email: commentData.email,
      },
      update: {
        username: commentData.username,
        homepage: commentData.homepage,
        client_meta: commentData.client_meta,
      },
      create: {
        username: commentData.username,
        email: commentData.email,
        homepage: commentData.homepage,
        client_meta: commentData.client_meta,
      },
    });
    const res = await prisma.comment.create({
      data: {
        text: commentData.text,
        userId: user.id,
        parentId: commentData.parentId,
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
    throw new Error("Failed to create comment");
  }
};
