// components/TaskItem.js
"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Task {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
}

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (id: string, newStatus: Task["status"]) => void;
  onDeleteTask: (id: string) => void;
}

export default function TaskItem({ task, onUpdateStatus, onDeleteTask }: TaskItemProps) {
  return (
    <li className="flex items-center gap-4 mb-4 p-2 border rounded">
      <span
        className={`flex-1 ${
          task.status === "completed"
            ? "line-through text-gray-500"
            : task.status === "ongoing"
            ? "text-yellow-600"
            : "text-gray-900"
        }`}
      >
        {task.text}
      </span>
      <Select
        value={task.status}
        onValueChange={(newStatus) => onUpdateStatus(task.id, newStatus as Task["status"])}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not-started">Not Started</SelectItem>
          <SelectItem value="ongoing">Ongoing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDeleteTask(task.id)}
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </li>
  );
}