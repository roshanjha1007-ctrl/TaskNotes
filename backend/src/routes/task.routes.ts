import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addNote,
  deleteNote,
} from '../controllers/task.controller';

const router = Router();

// ─── Validation Chains ────────────────────────────────────────────────────────

const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }).withMessage('Title must be ≤ 200 characters.'),
  body('description').optional().isString().isLength({ max: 2000 }).withMessage('Description must be ≤ 2000 characters.'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('priority must be low, medium, or high.'),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid ISO date string.'),
  body('notes').optional().isArray({ max: 10 }).withMessage('notes must be an array with at most 10 items.'),
  body('notes.*.content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Initial note content cannot be empty.')
    .isLength({ max: 5000 })
    .withMessage('Initial note must be ≤ 5000 characters.'),
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty.').isLength({ max: 200 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('priority must be low, medium, or high.'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be a valid ISO date string.'),
  body('completed').optional().isBoolean().withMessage('completed must be a boolean.'),
];

const noteRules = [
  body('content').trim().notEmpty().withMessage('Note content is required.').isLength({ max: 5000 }).withMessage('Note must be ≤ 5000 characters.'),
];

const cuidRule = /^[a-z0-9]{25,}$/i;

const idParamRules = [
  param('id').optional().matches(cuidRule).withMessage('Invalid task id.'),
  param('noteId').optional().matches(cuidRule).withMessage('Invalid note id.'),
];

const listQueryRules = [
  query('status').optional().isIn(['all', 'pending', 'completed']).withMessage('status must be all, pending, or completed.'),
  query('q').optional().isString().isLength({ max: 100 }).withMessage('Search query must be ≤ 100 characters.'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
  query('pageSize').optional().isInt({ min: 1, max: 50 }).withMessage('pageSize must be between 1 and 50.'),
];

// ─── Task Routes ──────────────────────────────────────────────────────────────

router.use(requireAuth);

router.post('/', validate(createTaskRules), createTask);
router.get('/', validate(listQueryRules), getTasks);
router.get('/:id', validate(idParamRules), getTaskById);
router.put('/:id', validate([...idParamRules, ...updateTaskRules]), updateTask);
router.delete('/:id', validate(idParamRules), deleteTask);

// ─── Note Sub-Routes ──────────────────────────────────────────────────────────

router.post('/:id/notes', validate([...idParamRules, ...noteRules]), addNote);
router.delete('/:id/notes/:noteId', validate(idParamRules), deleteNote);

export default router;
