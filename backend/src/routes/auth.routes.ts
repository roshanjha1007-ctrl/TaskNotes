import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me', requireAuth, (req, res) => {
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const userEmail = req.user?.email?.trim().toLowerCase() ?? null;

  res.json({
    success: true,
    data: {
      id: req.user?.id,
      email: req.user?.email ?? null,
      isOwner: Boolean(ownerEmail && userEmail && ownerEmail === userEmail),
    },
    message: 'Authenticated user fetched successfully.',
  });
});

export default router;
