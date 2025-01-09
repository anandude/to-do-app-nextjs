"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"

import { db } from "../database/firebase";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksArray = [];
      querySnapshot.forEach((doc) => {
        tasksArray.push({ ...doc.data(), id: doc.id });
      });
      setTasks(tasksArray);
    });
    return () => unsubscribe();
  }, []);

  const addTask = async () => {
    await addDoc(collection(db, "tasks"), {
      text: newTask,
      status: "not-started",
    });
    setNewTask("");
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: newStatus,
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <ScrollArea className="p-6">
      <div className="w-[700] h-[600]">
        <h1 className="text-2xl font-bold mb-4 text-center">To-Do List</h1>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
          />
          <Button onClick={addTask}>Add Task</Button>
        </div>
        
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-4 mb-4 p-2 border rounded"
            >
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
                onValueChange={(newStatus) =>
                  updateTaskStatus(task.id, newStatus)
                }
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
            </li>
          ))}
        </ul>
        
      </div>
      </ScrollArea>
    </div>
  );
}
