import prisma from "../../prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerService = async (payload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const existingUsername = await prisma.user.findUnique({
    where: {
      username: payload.username,
    },
  });
  if (existingUsername) {
    throw new Error("Username already exists");
  }

  const hashedPass = await bcrypt.hash(payload.password, 10);
  return prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPass,
      username: payload.username,
      homepage: payload.homepage ?? null,
      client_meta: payload.client_meta ?? "",
    },
    select: {
      id: true,
      username: true,
      email: true,
      homepage: true,
      client_meta: true,
    },
  });
};

export const loginService = async (payload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  if (!user?.password) {
    throw new Error("Password is not set");
  }
  const isMatch = await bcrypt.compare(payload.password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "1h",
    },
  );
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      homepage: user.homepage ?? "",
    },
    accessToken,
    refreshToken,
  };
};
