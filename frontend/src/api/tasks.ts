import client from './client';
import {
  Task,
  Note,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateNotePayload,
  TaskFilter,
  ApiSuccess,
  TaskListMeta,
  TaskListResponse,
} from '../types';

export const tasksApi = {
  getAll: async (
    filter: TaskFilter = 'all',
    search = '',
    page = 1,
    pageSize = 20,
  ): Promise<TaskListResponse> => {
    const params = {
      ...(filter !== 'all' ? { status: filter } : {}),
      ...(search.trim() ? { q: search.trim() } : {}),
      page,
      pageSize,
    };
    const { data } = await client.get<ApiSuccess<Task[]>>('/tasks', { params });
    return {
      items: data.data,
      meta: data.meta as unknown as TaskListMeta,
    };
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await client.get<ApiSuccess<Task>>(`/tasks/${id}`);
    return data.data;
  },

  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await client.post<ApiSuccess<Task>>('/tasks', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await client.put<ApiSuccess<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/tasks/${id}`);
  },

  addNote: async (taskId: string, payload: CreateNotePayload): Promise<Note> => {
    const { data } = await client.post<ApiSuccess<Note>>(
      `/tasks/${taskId}/notes`,
      payload,
    );
    return data.data;
  },

  deleteNote: async (taskId: string, noteId: string): Promise<void> => {
    await client.delete(`/tasks/${taskId}/notes/${noteId}`);
  },
};
