import { NextFunction, Request, Response } from 'express';
import { getFirebaseAdminAuth } from '../lib/firebase-admin';
import { AppError } from './errorHandler';

function extractBearerToken(req: Request): string | null {
  const header = req.header('authorization');
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function getUserId(uid: unknown): string | null {
  if (typeof uid !== 'string' || !uid) return null;
  return uid;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req);
    if (!token) throw new AppError(401, 'Missing bearer token.');

    const payload = await getFirebaseAdminAuth().verifyIdToken(token);

    const userId = getUserId(payload.uid);
    if (!userId) throw new AppError(401, 'Invalid auth token.');

    req.user = {
      id: userId,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      token: payload,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError(401, 'Authentication failed.'));
  }
}
