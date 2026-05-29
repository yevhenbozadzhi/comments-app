import { registerUserSchema } from "../../validation/auth/auth.js";
import { registerService } from "../../services/auth/auth.js";
import { verifyCaptcha } from "../../services/getCaptcha.js";
import { loginUserSchema } from "../../validation/auth/auth.js";
import { loginService } from "../../services/auth/auth.js";
import prisma from "../../prisma.js";

export const registerController = async (req, res) => {
  const validatedBody = registerUserSchema.parse(req.body);
  const ok = await verifyCaptcha(
    validatedBody.captchaSessionId,
    validatedBody.captcha,
  );
  if (!ok) {
    return res.status(400).json({ message: "Invalid captcha" });
  }
  try {
    const result = await registerService(validatedBody);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginController = async (req, res) => {
  const validatedBody = loginUserSchema.parse(req.body);
  const ok = await verifyCaptcha(
    validatedBody.captchaSessionId,
    validatedBody.captcha,
  );
  if (!ok) {
    return res.status(400).json({ message: "Invalid captcha" });
  }
  try {
    const result = await loginService(validatedBody);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const meCommentController = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.userId,
    },
    select: {
      id: true,
      username: true,
      email: true,
      homepage: true,
    },
  });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  res.status(200).json(user);
};
