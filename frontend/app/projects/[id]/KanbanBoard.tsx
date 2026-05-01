"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  useDraggable,
} from "@dnd-kit/core";
import type { Task, TaskStatus, Priority } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TaskDetailsModal } from "./TaskDetailsModal";

// Column metadata: header color matches the To Do / In Progress / Done convention.
const COLUMNS: { id: TaskStatus; title: string; accent: string }[] = [
  { id: "TODO", title: "To Do", accent: "border-blue-300 bg-blue-50/60" },
  { id: "IN_PROGRESS", title: "In Progress", accent: "border-amber-300 bg-amber-50/60" },
  { id: "DONE", title: "Done", accent: "border-emerald-300 bg-emerald-50/60" },
];

// Cycle order: NONE -> LOW -> MEDIUM -> HIGH -> NONE -> ...
const PRIORITY_CYCLE: Priority[] = ["NONE", "LOW", "MEDIUM", "HIGH"];

// Tailwind classes for the priority dot on each task card.
const PRIORITY_STYLE: Record<Priority, { dot: string; label: string }> = {
  NONE: { dot: "bg-zinc-200", label: "No priority" },
  LOW: { dot: "bg-blue-400", label: "Low" },
  MEDIUM: { dot: "bg-amber-400", label: "Medium" },
  HIGH: { dot: "bg-red-500", label: "High" },
};

type Props = {
  tasks: Task[];
  onAdd: (title: string) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<void>;
  onMove: (id: string, status: TaskStatus, order: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function KanbanBoard({ tasks, onAdd, onUpdate, onMove, onDelete }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Search and priority filter state lives here so the whole board reacts to it.
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");
  const [openTask, setOpenTask] = useState<Task | null>(null);

  // Apply both filters
  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = String(active.id);
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;
    const inColumn = tasks.filter((t) => t.status === newStatus);
    onMove(taskId, newStatus, inColumn.length);
  }

  return (
    <>
      {/* Search + priority filter pills */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["ALL", "NONE", "LOW", "MEDIUM", "HIGH"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                priorityFilter === p
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {p === "ALL" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              accent={col.accent}
              tasks={filteredTasks
                .filter((t) => t.status === col.id)
                .sort((a, b) => a.order - b.order)}
              onAdd={col.id === "TODO" ? onAdd : undefined}
              onUpdate={onUpdate}
              onOpen={(task) => setOpenTask(task)}
            />
          ))}
        </div>
      </DndContext>

      <TaskDetailsModal
        task={openTask}
        onClose={() => setOpenTask(null)}
        onSave={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}

function Column({
  id,
  title,
  accent,
  tasks,
  onAdd,
  onUpdate,
  onOpen,
}: {
  id: TaskStatus;
  title: string;
  accent: string;
  tasks: Task[];
  onAdd?: (title: string) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<void>;
  onOpen: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!onAdd || !newTitle.trim()) return;
    setAdding(true);
    try {
      await onAdd(newTitle);
      setNewTitle("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[400px] flex-col rounded-lg border-2 p-3 transition ${accent} ${
        isOver ? "ring-2 ring-zinc-400" : ""
      }`}
    >
      <h3 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-zinc-700">
        {title} <span className="text-zinc-400">({tasks.length})</span>
      </h3>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <p className="px-1 text-xs italic text-zinc-400">
            {onAdd ? "No tasks yet — add one below." : "Drop tasks here."}
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onOpen={onOpen}
            />
          ))
        )}
      </div>

      {onAdd && (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button type="submit" disabled={adding || !newTitle.trim()}>
            +
          </Button>
        </form>
      )}
    </div>
  );
}

function TaskCard({
  task,
  onUpdate,
  onOpen,
}: {
  task: Task;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<void>;
  onOpen: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.6 : 1,
      }
    : { opacity: isDragging ? 0.6 : 1 };

  // Click the priority dot to cycle to the next level
  function cyclePriority(e: React.MouseEvent) {
    e.stopPropagation();
    const next =
      PRIORITY_CYCLE[
        (PRIORITY_CYCLE.indexOf(task.priority) + 1) % PRIORITY_CYCLE.length
      ];
    onUpdate(task.id, { priority: next });
  }

  const priority = PRIORITY_STYLE[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-zinc-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <button
          onClick={cyclePriority}
          title={`Priority: ${priority.label} (click to change)`}
          className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${priority.dot} hover:ring-2 hover:ring-zinc-300`}
        />
        <div
          className="flex-1 cursor-grab text-sm font-medium active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          {task.title}
        </div>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 pl-5 text-xs text-zinc-500">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          onClick={() => onOpen(task)}
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          Open
        </button>
      </div>
    </div>
  );
}
