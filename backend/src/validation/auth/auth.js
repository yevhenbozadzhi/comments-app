import { z } from "zod";

export const registerUserSchema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Username must contain only letters and numbers",
      ),
    email: z.string().email(),
    password: z.string().min(8).max(50),
    confirmPassword: z.string().min(8).max(50),
    captcha: z.string().min(1).max(100, "Captcha is required"),
    captchaSessionId: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(50),
  captcha: z.string().min(1).max(100, "Captcha is required"),
  captchaSessionId: z.string(),
});
