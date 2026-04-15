import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks';
import {
  Task,
  TaskCounts,
  TaskFilter,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateNotePayload,
} from '../types';

export function useTasks(enabled = true) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [counts, setCounts] = useState<TaskCounts>({ all: 0, pending: 0, completed: 0 });

  const load = useCallback(async (f: TaskFilter, query: string, nextPage: number, append = false) => {
    if (!enabled) return;
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await tasksApi.getAll(f, query, nextPage);
      setTasks((current) => (append ? [...current, ...response.items] : response.items));
      setCounts(response.meta.counts);
      setTotalPages(response.meta.totalPages);
      setHasNextPage(response.meta.hasNextPage);
      setHasPreviousPage(response.meta.hasPreviousPage);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to load tasks.');
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    setPage(1);
    load(filter, search, 1, false);
  }, [enabled, filter, search, load]);

  const createTask = async (payload: CreateTaskPayload) => {
    const task = await tasksApi.create(payload);
    setPage(1);
    await load(filter, search, 1, false);
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    const updated = await tasksApi.update(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id);
    const nextPage = tasks.length === 1 && page > 1 ? page - 1 : 1;
    setPage(nextPage);
    await load(filter, search, nextPage, false);
  };

  const toggleTask = (id: string, completed: boolean) =>
    updateTask(id, { completed: !completed });

  const addNote = async (taskId: string, payload: CreateNotePayload) => {
    const note = await tasksApi.addNote(taskId, payload);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes: [...t.notes, note] } : t)),
    );
    return note;
  };

  const deleteNote = async (taskId: string, noteId: string) => {
    await tasksApi.deleteNote(taskId, noteId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) } : t,
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
      setSearch(value);
    },
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage: async () => {
      if (!hasNextPage || loadingMore) return;
      const nextPage = page + 1;
      setPage(nextPage);
      await load(filter, search, nextPage, true);
    },
    goToPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
    loading,
    loadingMore,
    error,
    counts,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    addNote,
    deleteNote,
  };
}
