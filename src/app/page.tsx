// app/page.js
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../database/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/ui/TaskList";

type Task = {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const q = query(collection(db, "tasks"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksArray: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksArray.push({ id: doc.id, text: data.text, status: data.status });
      });
      setTasks(tasksArray);
    });
    return () => unsubscribe();
  }, []);

  interface NewTask {
    text: string;
    status: string;
  }

  const addTask = async (newTaskText: string): Promise<void> => {
    const newTask: NewTask = {
      text: newTaskText,
      status: "not-started",
    };
    await addDoc(collection(db, "tasks"), newTask);
  };

  interface UpdateTaskStatus {
    (taskId: string, newStatus: string): Promise<void>;
  }

  const updateTaskStatus: UpdateTaskStatus = async (taskId, newStatus) => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: newStatus,
    });
  };

  interface DeleteTask {
    (taskId: string): Promise<void>;
  }

  const deleteTask: DeleteTask = async (taskId) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <ScrollArea className="p-6">
        <div className="w-[700] h-[600]">
          <h1 className="text-2xl font-bold mb-4 text-center">To-Do List</h1>
          <TaskForm onAddTask={addTask} />
          <TaskList
            tasks={tasks}
            onUpdateStatus={updateTaskStatus}
            onDeleteTask={deleteTask}
          />
        </div>
      </ScrollArea>
    </div>
  );
}