import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { NextFunction, Request, Response } from 'express';
import { AppError } from './errorHandler';

const supabaseUrl = process.env.SUPABASE_URL;
const jwks = supabaseUrl
  ? createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))
  : null;

function extractBearerToken(req: Request): string | null {
  const header = req.header('authorization');
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function getUserId(payload: JWTPayload): string | null {
  if (typeof payload.sub !== 'string' || !payload.sub) return null;
  return payload.sub;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!supabaseUrl || !jwks) {
      throw new AppError(500, 'SUPABASE_URL is not configured on the server.');
    }

    const token = extractBearerToken(req);
    if (!token) throw new AppError(401, 'Missing bearer token.');

    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    });

    const userId = getUserId(payload);
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
