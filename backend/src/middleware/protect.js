import helmet from "helmet";
import rateLimiter from "express-rate-limit";
import jwt from "jsonwebtoken";
export const helmetMiddleware = helmet();

export const rateLimiterMiddleware = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  headers: true,
});
