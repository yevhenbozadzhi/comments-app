import { z } from "zod";

export const createCommentSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9]+$/),
  email: z.string().email(),
  homepage: z.string().url().optional().or(z.literal("")),
  text: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
  client_meta: z.string().optional(),
  captchaSessionId: z.string(),
  captcha: z.string().min(1),
});
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9]+$/, "Username must contain only letters and numbers"),
  email: z.string().email(),
  homepage: z.string().url().optional(),
  client_meta: z.string().optional(),
});
