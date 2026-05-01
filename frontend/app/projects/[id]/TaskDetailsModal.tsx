"use client";

import { useEffect, useState } from "react";
import type { Task, Priority, TaskStatus } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  task: Task | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

// A modal that shows full task details and lets the user edit them.
// Opens when the user clicks a task; closes on save, delete, or backdrop click.
export function TaskDetailsModal({ task, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("NONE");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [saving, setSaving] = useState(false);

  // When the task prop changes, fill the form with its values
  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setStatus(task.status);
  }, [task]);

  async function save() {
    if (!task) return;
    setSaving(true);
    try {
      await onSave(task.id, {
        title,
        description: description || null,
        priority,
        status,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!task) return;
    if (!confirm("Delete this task?")) return;
    await onDelete(task.id);
    onClose();
  }

  return (
    <Modal open={!!task} onClose={onClose}>
      <h2 className="mb-3 text-lg font-semibold">Edit task</h2>

      <div className="flex flex-col gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={4}
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-zinc-600">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-zinc-600">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              <option value="NONE">None</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <Button variant="danger" onClick={remove}>
          Delete
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !title.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
