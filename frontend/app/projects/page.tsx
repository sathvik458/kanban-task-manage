"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  // Track which project is currently being edited (id) and the draft values
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  }, [user]);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await api.post<Project>("/projects", {
        name,
        description: description || undefined,
      });
      setProjects([res.data, ...projects]);
      setName("");
      setDescription("");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(p: Project) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDescription(p.description ?? "");
  }

  async function saveEdit(id: string) {
    const res = await api.patch<Project>(`/projects/${id}`, {
      name: editName,
      description: editDescription || null,
    });
    setProjects(projects.map((p) => (p.id === id ? res.data : p)));
    setEditingId(null);
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all its tasks?")) return;
    await api.delete(`/projects/${id}`);
    setProjects(projects.filter((p) => p.id !== id));
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-zinc-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => logout().then(() => router.push("/login"))}
        >
          Sign out
        </Button>
      </header>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Create a new project
        </h2>
        <form
          onSubmit={createProject}
          className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
        >
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-12 text-base sm:flex-1"
          />
          <Input
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 text-base sm:flex-[1.5]"
          />
          <Button
            type="submit"
            disabled={creating}
            className="h-12 px-6 text-base"
          >
            {creating ? "Adding..." : "Add project"}
          </Button>
        </form>
      </Card>

      {loading ? (
        <p className="text-zinc-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <Card className="text-center text-zinc-500">
          <p className="font-medium">No projects yet.</p>
          <p className="text-sm">Create your first one above to get started.</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Card className="flex h-full flex-col justify-between">
                {editingId === p.id ? (
                  // Inline edit form
                  <div className="flex flex-col gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                    />
                    <Input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => saveEdit(p.id)}
                        disabled={!editName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Link
                        href={`/projects/${p.id}`}
                        className="text-lg font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.description && (
                        <p className="mt-1 text-sm text-zinc-600">
                          {p.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => startEdit(p)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => deleteProject(p.id)}>
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
