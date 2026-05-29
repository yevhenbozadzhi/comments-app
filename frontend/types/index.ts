export type User = {
  id: string;
  username: string;
  email: string;
  homepage: string;
  client_meta: string;
};

export type Attachment = {
  id: string;
  type: string;
  path: string;
  originalName: string;
};

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  parentId?: string;
  replies?: Comment[];
  attachment?: Attachment[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CommentsResponse = {
  comments: Comment[];
  pagination: Pagination;
};

export type CreateComment = {
  username: string;
  email: string;
  captcha: string;
  text: string;
  homepage?: string;
  captchaSessionId: string;
  parentId?: string;
  client_meta?: string;
};

export type PreviewComment = {
  text: string;
  username: string;
  email: string;
  homepage?: string;
};

export type Captcha = {
  sessionId: string;
  captcha: string;
};

export type CommentFormTypes = {
  username: string;
  email: string;
  homepage?: string;
  text: string;
  captcha: string;
  captchaSessionId: string;
  client_meta?: string;
  parentId?: string;
};

export type RegisterUser = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginUser = {
  email: string;
  password: string;
  ok?: boolean;
};

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  homepage: string;
};

export type CommentAuth = {
  text: string;
  captcha: string;
  captchaSessionId: string;
  homepage?: string;
  parentId?: string;
  client_meta?: string;
};
