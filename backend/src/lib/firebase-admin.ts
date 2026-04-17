import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { AppError } from '../middleware/errorHandler';

function getRequiredEnv(
  name: 'FIREBASE_PROJECT_ID' | 'FIREBASE_CLIENT_EMAIL' | 'FIREBASE_PRIVATE_KEY',
) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AppError(500, `${name} is not configured on the server.`);
  }

  return value;
}

function getFirebaseAdminApp() {
  const existingApp = getApps()[0];
  if (existingApp) {
    return existingApp;
  }

  return initializeApp({
    credential: cert({
      projectId: getRequiredEnv('FIREBASE_PROJECT_ID'),
      clientEmail: getRequiredEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: getRequiredEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}
