"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Project, Task, TaskStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { KanbanBoard } from "./KanbanBoard";

// Page that loads one project and its tasks, then renders the kanban board.
export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get<Project>(`/projects/${id}`),
      api.get<Task[]>(`/projects/${id}/tasks`),
    ])
      .then(([p, t]) => {
        setProject(p.data);
        setTasks(t.data);
      })
      .catch(() => router.replace("/projects"))
      .finally(() => setLoading(false));
  }, [id, user, router]);

  // Add a new task to the TODO column. Backend assigns the order.
  async function addTask(title: string) {
    const res = await api.post<Task>(`/projects/${id}/tasks`, { title });
    setTasks([...tasks, res.data]);
  }

  // Update a task and replace it in local state.
  async function updateTask(taskId: string, patch: Partial<Task>) {
    const res = await api.patch<Task>(`/tasks/${taskId}`, patch);
    setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
  }

  // Optimistic move: update locally first for snappy UX, then persist.
  async function moveTask(taskId: string, newStatus: TaskStatus, newOrder: number) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t,
      ),
    );
    await api.patch(`/tasks/${taskId}`, { status: newStatus, order: newOrder });
  }

  async function deleteTask(taskId: string) {
    await api.delete(`/tasks/${taskId}`);
    setTasks(tasks.filter((t) => t.id !== taskId));
  }

  if (authLoading || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/projects" className="text-sm text-zinc-500 hover:underline">
            &larr; All projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-zinc-600">{project.description}</p>
          )}
        </div>
      </header>

      <KanbanBoard
        tasks={tasks}
        onAdd={addTask}
        onUpdate={updateTask}
        onMove={moveTask}
        onDelete={deleteTask}
      />
    </div>
  );
}
