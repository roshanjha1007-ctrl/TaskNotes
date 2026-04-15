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

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [counts, setCounts] = useState<TaskCounts>({ all: 0, pending: 0, completed: 0 });

  const load = useCallback(async (f: TaskFilter, query: string, nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksApi.getAll(f, query, nextPage);
      setTasks(response.items);
      setCounts(response.meta.counts);
      setTotalPages(response.meta.totalPages);
      setHasNextPage(response.meta.hasNextPage);
      setHasPreviousPage(response.meta.hasPreviousPage);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err.message ?? 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter, search, page);
  }, [filter, search, page, load]);

  const createTask = async (payload: CreateTaskPayload) => {
    const task = await tasksApi.create(payload);
    await load(filter, search, 1);
    setPage(1);
    return task;
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    const updated = await tasksApi.update(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id);
    const nextPage = tasks.length === 1 && page > 1 ? page - 1 : page;
    await load(filter, search, nextPage);
    setPage(nextPage);
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
