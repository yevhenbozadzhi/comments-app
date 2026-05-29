import prisma from "../prisma.js";
import { buildOrderBy } from "../lib/orderedBy.js";
export const getComments = async (
  page = 1,
  sortBy = "createdAt",
  sortOrder = "desc",
) => {
  const pageNum = Number(page) || 1;
  try {
    const res = await prisma.comment.findMany({
      where: {
        parentId: null,
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
      orderBy: buildOrderBy(sortBy, sortOrder),
      skip: (pageNum - 1) * 25,
      take: 25,
    });
    const total = await prisma.comment.count({ where: { parentId: null } });
    return {
      comments: res,
      pagination: {
        page: pageNum,
        limit: 25,
        total: total,
        totalPages: Math.ceil(total / 25),
      },
    };
  } catch {
    throw new Error("Failed to get comments");
  }
};
