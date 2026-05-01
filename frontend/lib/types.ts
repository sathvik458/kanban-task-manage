// Shared types that match the backend's responses.
export type User = { id: string; email: string };

export type Project = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  order: number;
  projectId: string;
  createdAt: string;
};
