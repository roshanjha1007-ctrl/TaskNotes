import type { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      user?: {
        id: string;
        email?: string;
        token: DecodedIdToken;
      };
    }
  }
}

export {};
