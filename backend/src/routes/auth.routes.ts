import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user?.id,
      email: req.user?.email ?? null,
    },
    message: 'Authenticated user fetched successfully.',
  });
});

export default router;
