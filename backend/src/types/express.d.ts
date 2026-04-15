import type { JwtPayload } from 'jose';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        email?: string;
        token: JwtPayload;
      };
    }
  }
}

export {};
