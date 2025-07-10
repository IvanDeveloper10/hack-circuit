export type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type Comment = {
  id: string;
  postId: string;
  parentId: string | null;
  author: string;
  text: string;
  createdAt: number;
};
