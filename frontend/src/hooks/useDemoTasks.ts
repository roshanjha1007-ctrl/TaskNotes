import { useEffect, useState } from 'react';
import {
  createDemoNote,
  createDemoTask,
  filterDemoTasks,
  getTaskCounts,
  readDemoTasks,
  writeDemoTasks,
  updateDemoTask,
} from '../lib/demo';
import {
  CreateNotePayload,
  CreateTaskPayload,
  Task,
  TaskCounts,
  TaskFilter,
  UpdateTaskPayload,
} from '../types';

const PAGE_SIZE = 20;

export function useDemoTasks(enabled: boolean, userId: string | null) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(enabled);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [counts, setCounts] = useState<TaskCounts>({ all: 0, pending: 0, completed: 0 });

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);

    const storedTasks = readDemoTasks();
    setAllTasks(storedTasks);
    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const nextCounts = getTaskCounts(allTasks);
    const filtered = filterDemoTasks(allTasks, filter, search);
    const nextTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, nextTotalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;

    setTasks(filtered.slice(startIndex, startIndex + PAGE_SIZE));
    setCounts(nextCounts);
    setTotalPages(nextTotalPages);
    setHasPreviousPage(safePage > 1);
    setHasNextPage(safePage < nextTotalPages);
    if (safePage !== page) setPage(safePage);
  }, [allTasks, enabled, filter, page, search]);

  const persist = (updater: (current: Task[]) => Task[]) => {
    setAllTasks((current) => {
      const next = updater(current);
      writeDemoTasks(next);
      return next;
    });
  };

  const createTask = async (payload: CreateTaskPayload) => {
    if (!enabled || !userId) throw new Error('Demo mode is not available.');

    const task = createDemoTask(userId, payload);
    persist((current) => [task, ...current]);
    setPage(1);
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    let updatedTask: Task | null = null;
    persist((current) =>
      current.map((task) => {
        if (task.id !== id) return task;
        updatedTask = updateDemoTask(task, payload);
        return updatedTask;
      }),
    );

    if (!updatedTask) throw new Error('Task not found.');
    return updatedTask;
  };

  const deleteTask = async (id: string) => {
    persist((current) => current.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string, completed: boolean) => updateTask(id, { completed: !completed });

  const addNote = async (taskId: string, payload: CreateNotePayload) => {
    const note = createDemoNote(taskId, payload);
    persist((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              notes: [...task.notes, note],
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    return note;
  };

  const deleteNote = async (taskId: string, noteId: string) => {
    persist((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              notes: task.notes.filter((note) => note.id !== noteId),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  return {
    tasks,
    filter,
    setFilter: (nextFilter: TaskFilter) => {
      setPage(1);
      setFilter(nextFilter);
    },
    search,
    setSearch: (value: string) => {
      setPage(1);
      setSearch(value);
    },
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage: () => setPage((current) => current + 1),
    goToPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
    loading,
    error: null,
    counts,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    addNote,
    deleteNote,
  };
}
