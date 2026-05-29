import {

  CommentsResponse,

  CreateComment,

  Comment,

  Captcha,

  Attachment,

} from "@/types";



export const getComments = async (

  page: number,

  sortBy: string,

  sortOrder: string,

): Promise<CommentsResponse> => {

  try {

    const res = await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/comments?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`,

    );

    return await res.json();

  } catch (error) {

    console.error(error);

    throw new Error("Failed to fetch comments");

  }

};



export const createComment = async (

  comment: CreateComment,

): Promise<Comment> => {

  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {

      method: "POST",

      body: JSON.stringify(comment),

      headers: authToken(),

    });

    if (!res.ok) {

      const error = await res.json();

      throw new Error(error.message);

    }

    return await res.json();

  } catch (error) {

    console.error(error);

    if (error instanceof Error) {

      throw error;

    }

    throw new Error("Failed to create comment");

  }

};



export const deleteComment = async (id: string) => {

  try {

    const res = await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}`,

      {

        method: "DELETE",

        headers: authToken(),

      },

    );

    return await res.json();

  } catch (error) {

    console.error(error);

    throw new Error("Failed to delete comment");

  }

};



export const getReplies = async (parentId: string): Promise<Comment[]> => {

  try {

    const res = await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${parentId}/replies`,

    );

    return await res.json();

  } catch (error) {

    console.error(error);

    throw new Error("Failed to get replies");

  }

};



export const createReply = async (

  parentId: string,

  comment: CreateComment,

): Promise<Comment> => {

  try {

    const res = await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${parentId}/reply`,

      {

        method: "POST",

        body: JSON.stringify(comment),

        headers: authToken(),

      },

    );

    if (!res.ok) {

      const error = await res.json();

      throw new Error(error.message);

    }

    return await res.json();

  } catch (error) {

    console.error(error);

    if (error instanceof Error) {

      throw error;

    }

    throw new Error("Failed to create reply");

  }

};



export const getCaptcha = async (): Promise<Captcha> => {

  try {

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/captcha`);

    return await res.json();

  } catch (error) {

    console.error(error);

    throw new Error("Failed to get captcha");

  }

};



export const uploadAttachment = async (

  id: string,

  attachment: File,

): Promise<Attachment> => {

  try {

    const formData = new FormData();

    formData.append("attachment", attachment);

    const token =

      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {};

    if (token) {

      headers.Authorization = `Bearer ${token}`;

    }

    const res = await fetch(

      `${process.env.NEXT_PUBLIC_API_URL}/api/comments/${id}/attachments`,

      {

        method: "POST",

        body: formData,

        headers,

      },

    );

    if (!res.ok) {

      const error = await res.json();

      throw new Error(error.message);

    }

    return await res.json();

  } catch (error) {

    console.error(error);

    if (error instanceof Error) {

      throw error;

    }

    throw new Error("Failed to upload attachment");

  }

};



export const previewComment = async (comment: {
  text: string;
  username: string;
  email: string;
  homepage?: string;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/comments/preview`,
      {
        method: "POST",
        body: JSON.stringify(comment),
        headers: authToken(),
      },
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message);
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to preview comment");
  }
};

export const authToken = () => {

  const token =

    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {

    "Content-Type": "application/json",

  };



  if (token) {

    headers.Authorization = `Bearer ${token}`;

  }

  return headers;

};


