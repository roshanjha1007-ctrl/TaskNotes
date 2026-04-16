import { Router } from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getQuestions, saveQuestions } from '../controllers/reflection.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getQuestions);
router.post(
  '/',
  validate([body('questions').isArray().withMessage('questions must be an array.')]),
  saveQuestions,
);

export default router;
