"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  getDocs,
  limitToLast,
  endBefore,
  serverTimestamp,
  FieldValue,
  Timestamp,
  QuerySnapshot,
} from "firebase/firestore";
import { db } from "../database/firebase";
import {format} from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/ui/TaskList";
import PaginationDemo from "@/components/ui/PaginationS";
// import { ClipboardList } from "lucide-react";

type Task = {
  id: string;
  text: string;
  status: "not-started" | "ongoing" | "completed";
  createdAt: string;
};

interface NewTask {
  text: string;
  status: string;
  createdAt: FieldValue | Timestamp;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [firstDoc, setFirstDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageCache, setPageCache] = useState<
    Map<number, QueryDocumentSnapshot<DocumentData>>
  >(new Map());
  const tasksPerPage = 7;

  // Modified total pages calculation
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "tasks"), orderBy("createdAt", "desc")),
      async (snapshot) => {
        // Get actual count of documents
        const actualCount = snapshot.size;
        const calculatedPages = Math.max(
          1,
          Math.ceil(actualCount / tasksPerPage)
        );

        // Only update if the calculated pages is different
        if (calculatedPages !== totalPages) {
          setTotalPages(calculatedPages);

          // If current page is beyond the new total, reset to last valid page
          if (currentPage > calculatedPages) {
            setCurrentPage(calculatedPages);
            // Fetch the last page
            const lastPageQuery = query(
              collection(db, "tasks"),
              orderBy("createdAt", "desc"),
              limit(tasksPerPage)
            );
            const querySnapshot = await getDocs(lastPageQuery);
            updateTasksFromSnapshot(querySnapshot);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [currentPage, totalPages]);

  // Helper function to update tasks from snapshot
  const updateTasksFromSnapshot = (
    querySnapshot: QuerySnapshot<DocumentData>
  ) => {
    const tasksArray: Task[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      tasksArray.push({ id: doc.id, text: data.text, status: data.status,createdAt: data.createdAt
        ? format(data.createdAt.toDate(), "dd MMM yyyy, hh:mm a")
        : "Unknown", });
    });
    setTasks(tasksArray);
    if (querySnapshot.docs.length > 0) {
      setFirstDoc(querySnapshot.docs[0]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    }
  };

  // Initial page load
  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc"),
      limit(tasksPerPage)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      updateTasksFromSnapshot(querySnapshot);

      const newPageCache = new Map<
        number,
        QueryDocumentSnapshot<DocumentData>
      >();
      if (querySnapshot.docs.length > 0) {
        newPageCache.set(1, querySnapshot.docs[0]);
        setPageCache(newPageCache);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchNextPage = () => {
    if (currentPage >= totalPages || !lastDoc) return;
    const q = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(tasksPerPage)
    );
    onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        // If no more documents, don't update anything
        return;
      }
      updateTasksFromSnapshot(querySnapshot);
      setPageCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(currentPage + 1, querySnapshot.docs[0]);
        return newCache;
      });
      setCurrentPage(currentPage + 1);
    });
  };

  const fetchPreviousPage = () => {
    if (currentPage <= 1 || !firstDoc) return;
    const q = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc"),
      endBefore(firstDoc),
      limitToLast(tasksPerPage)
    );
    onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        // If no more documents, don't update anything
        return;
      }
      updateTasksFromSnapshot(querySnapshot);
      setPageCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(currentPage - 1, querySnapshot.docs[0]);
        return newCache;
      });
      setCurrentPage(currentPage - 1);
    });
  };

  const handlePageChange = async (page: number) => {
    if (page === currentPage || page > totalPages || page < 1) return;

    if (page === currentPage + 1) {
      fetchNextPage();
      return;
    }
    if (page === currentPage - 1) {
      fetchPreviousPage();
      return;
    }

    const cachedDoc = pageCache.get(page);
    if (cachedDoc) {
      const q = query(
        collection(db, "tasks"),
        orderBy("createdAt", "desc"),
        startAfter(cachedDoc),
        limit(tasksPerPage)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        updateTasksFromSnapshot(querySnapshot);
        setCurrentPage(page);
      }
      return;
    }

    // If not cached, fetch from beginning
    const q = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc"),
      limit(page * tasksPerPage)
    );
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    if (docs.length === 0) return;

    const startIndex = (page - 1) * tasksPerPage;
    const pageDocs = docs.slice(
      startIndex,
      Math.min(startIndex + tasksPerPage, docs.length)
    );

    const tasksArray: Task[] = [];
    pageDocs.forEach((doc) => {
      const data = doc.data();
      tasksArray.push({ 
        id: doc.id, 
        text: data.text, 
        status: data.status, 
        createdAt: data.createdAt ? format(data.createdAt.toDate(), "dd MMM yyyy, hh:mm a") : "Unknown" 
      });
    });

    setTasks(tasksArray);
    setFirstDoc(pageDocs[0]);
    setLastDoc(pageDocs[pageDocs.length - 1]);

    setPageCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(page, pageDocs[0]);
      return newCache;
    });

    setCurrentPage(page);
  };

  const addTask = async (newTaskText: string): Promise<void> => {
    const newTask: NewTask = {
      text: newTaskText,
      status: "not-started",
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "tasks"), newTask);
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: string
  ): Promise<void> => {
    await updateDoc(doc(db, "tasks", taskId), {
      status: newStatus,
    });
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <ScrollArea className="p-6">
          <div className="w-[700] h-[600] min-h-custom min-w-custom">
            <h1 className="text-2xl font-bold mb-4 text-center items-center">
              To-Do List
            </h1>
            <TaskForm onAddTask={addTask} />
            <TaskList
              tasks={[...tasks].sort((a, b) => {
                const statusOrder = {
                  ongoing: 1,
                  "not-started": 2,
                  completed: 3,
                };
                return statusOrder[a.status] - statusOrder[b.status];
              })}
              onUpdateStatus={updateTaskStatus}
              onDeleteTask={deleteTask}
            />
          </div>
          <PaginationDemo
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={fetchNextPage}
            onPreviousPage={fetchPreviousPage}
            onPageChange={handlePageChange}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
