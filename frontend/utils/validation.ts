export type CommentFormValues = {
  username: string;
  email: string;
  homepage: string;
  text: string;
  captcha: string;
  isAuthenticated: boolean;
};

export type CommentFormErrors = {
  username?: string;
  email?: string;
  homepage?: string;
  text?: string;
  captcha?: string;
};

export function validateCommentForm(
  values: CommentFormValues,
): CommentFormErrors {
  const errors: CommentFormErrors = {};

  if (!values.isAuthenticated) {
    if (!values.username.trim()) {
      errors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9]+$/.test(values.username.trim())) {
      errors.username = "Username: letters and numbers only";
    }

    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      errors.email = "Invalid email format";
    }

    if (
      values.homepage.trim() &&
      !/^https?:\/\/.+/i.test(values.homepage.trim())
    ) {
      errors.homepage = "Homepage must be a valid URL (https://...)";
    }
  }

  if (!values.text.trim()) {
    errors.text = "Text is required";
  }

  if (!values.captcha.trim()) {
    errors.captcha = "Captcha is required";
  }

  return errors;
}
