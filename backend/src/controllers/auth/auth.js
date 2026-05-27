import { registerUserSchema } from "../../validation/auth/auth.js";
import { registerService } from "../../services/auth/auth.js";
import { verifyCaptcha } from "../../services/getCaptcha.js";
import { loginUserSchema } from "../../validation/auth/auth.js";
import { loginService } from "../../services/auth/auth.js";
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
