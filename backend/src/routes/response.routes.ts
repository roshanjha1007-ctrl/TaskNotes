import { Router } from 'express';
import { body, query } from 'express-validator';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { getResponses, saveResponses } from '../controllers/reflection.controller';

const router = Router();

router.use(requireAuth);

router.get(
  '/',
  validate([
    query('startDate')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('startDate must be YYYY-MM-DD.'),
    query('endDate')
      .optional()
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('endDate must be YYYY-MM-DD.'),
  ]),
  getResponses,
);
router.post(
  '/',
  validate([
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD.'),
    body('answers').isArray().withMessage('answers must be an array.'),
  ]),
  saveResponses,
);

export default router;
