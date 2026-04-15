import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateTaskBody, UpdateTaskBody, CreateNoteBody, TaskListQuery } from '../types';

const TASK_INCLUDE = { notes: { orderBy: { createdAt: 'asc' as const } } };

function toPrismaPriority(priority?: 'low' | 'medium' | 'high') {
  return priority ? priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' : 'MEDIUM';
}

function getUserId(req: Request): string {
  if (!req.user?.id) throw new AppError(401, 'Authentication required.');
  return req.user.id;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, priority, dueDate, notes }: CreateTaskBody = req.body;
    const userId = getUserId(req);

    const task = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() ?? null,
        priority: toPrismaPriority(priority),
        dueDate: dueDate ? new Date(dueDate) : null,
        ...(notes?.length
          ? {
              notes: {
                create: notes
                  .map(({ content }) => content.trim())
                  .filter(Boolean)
                  .map((content) => ({ content })),
              },
            }
          : {}),
      },
      include: TASK_INCLUDE,
    });

    res.status(201).json({ success: true, data: task, message: 'Task created successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const {
      status,
      q,
      page = 1,
      pageSize = 20,
    } = req.query as unknown as TaskListQuery;

    const where =
      status === 'completed'
        ? { userId, completed: true }
        : status === 'pending'
          ? { userId, completed: false }
          : { userId };

    const search = q?.trim();
    const whereWithSearch = search
      ? {
          ...where,
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { notes: { some: { content: { contains: search, mode: 'insensitive' as const } } } },
          ],
        }
      : where;

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(50, Math.max(1, Number(pageSize) || 20));

    const [tasks, total, pendingCount, completedCount] = await prisma.$transaction([
      prisma.task.findMany({
        where: whereWithSearch,
        include: TASK_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      prisma.task.count({ where: whereWithSearch }),
      prisma.task.count({ where: { userId, completed: false } }),
      prisma.task.count({ where: { userId, completed: true } }),
    ]);

    res.json({
      success: true,
      data: tasks,
      message: 'Tasks fetched successfully.',
      meta: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / safePageSize)),
        hasNextPage: safePage * safePageSize < total,
        hasPreviousPage: safePage > 1,
        counts: {
          all: pendingCount + completedCount,
          pending: pendingCount,
          completed: completedCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: TASK_INCLUDE,
    });

    if (!task || task.userId !== getUserId(req)) throw new AppError(404, 'Task not found.');

    res.json({ success: true, data: task, message: 'Task fetched successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, priority, dueDate, completed }: UpdateTaskBody = req.body;
    const userId = getUserId(req);

    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== userId) throw new AppError(404, 'Task not found.');

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() || null }),
        ...(priority !== undefined && { priority: toPrismaPriority(priority) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completed !== undefined && { completed }),
      },
      include: TASK_INCLUDE,
    });

    res.json({ success: true, data: task, message: 'Task updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.userId !== getUserId(req)) throw new AppError(404, 'Task not found.');

    await prisma.task.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { id: req.params.id }, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { content }: CreateNoteBody = req.body;

    const taskExists = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!taskExists || taskExists.userId !== getUserId(req)) throw new AppError(404, 'Task not found.');

    const note = await prisma.note.create({
      data: { content: content.trim(), taskId: req.params.id },
    });

    res.status(201).json({ success: true, data: note, message: 'Note added successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await prisma.note.findFirst({
      where: { id: req.params.noteId, taskId: req.params.id, task: { userId: getUserId(req) } },
    });
    if (!note) throw new AppError(404, 'Note not found.');

    await prisma.note.delete({ where: { id: req.params.noteId } });

    res.json({ success: true, data: { id: req.params.noteId }, message: 'Note deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
