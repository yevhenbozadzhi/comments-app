import crypto from "crypto";
import svgCaptcha from "svg-captcha";
const captchaStore = new Map();

export const getCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 4,
    noise: 2,
    color: true,
    background: "#f0f0f0",
  });
  const sessionId = crypto.randomUUID();
  captchaStore.set(sessionId, captcha.text.toLowerCase());
  setTimeout(() => {
    captchaStore.delete(sessionId);
  }, 60000);
  return {
    sessionId,
    captcha: captcha.data,
  };
};

export const verifyCaptcha = (sessionId, captcha) => {
  const storedCaptcha = captchaStore.get(sessionId);
  if (!storedCaptcha) {
    return false;
  }
  const ok = storedCaptcha === captcha.toLowerCase();
  if (ok) {
    captchaStore.delete(sessionId);
  }
  return ok;
};
