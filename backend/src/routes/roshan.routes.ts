import crypto from 'crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const verifyRoshanLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many Roshan access attempts. Please try again in a minute.',
  },
});

interface RoshanTokenPayload {
  scope: 'roshan-dashboard';
  exp: number;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString('base64url');
}

function decodeBase64Url<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

function signRoshanPayload(encodedPayload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function getRoshanConfig() {
  const code = process.env.ROSHAN_CODE?.trim();
  const password = process.env.ROSHAN_ACCESS_SECRET?.trim();

  if (!code || !password) {
    throw new AppError(500, 'Roshan access is not configured on the server.');
  }

  return { code, password };
}

function issueRoshanToken(password: string) {
  const payload: RoshanTokenPayload = {
    scope: 'roshan-dashboard',
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signRoshanPayload(encodedPayload, password);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp).toISOString(),
  };
}

function verifyRoshanToken(token: string, secret: string) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    throw new AppError(401, 'Roshan access is invalid.');
  }

  const expectedSignature = signRoshanPayload(encodedPayload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new AppError(401, 'Roshan access is invalid.');
  }

  const payload = decodeBase64Url<RoshanTokenPayload>(encodedPayload);
  if (!payload || payload.scope !== 'roshan-dashboard' || payload.exp <= Date.now()) {
    throw new AppError(401, 'Roshan access expired.');
  }

  return {
    token,
    expiresAt: new Date(payload.exp).toISOString(),
  };
}

function readBearerToken(authorizationHeader?: string) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

function codesMatch(submittedCode: string, expectedCode: string) {
  const submittedBuffer = Buffer.from(submittedCode);
  const expectedBuffer = Buffer.from(expectedCode);

  if (submittedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(submittedBuffer, expectedBuffer);
}

router.post('/verify-roshan', verifyRoshanLimiter, (req, res, next) => {
  try {
    const { code, password } = getRoshanConfig();
    const submittedCode = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const submittedPassword = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

    if (!submittedCode) {
      throw new AppError(400, 'Enter the first passcode.');
    }

    if (!codesMatch(submittedCode, code)) {
      throw new AppError(401, 'Invalid first passcode.');
    }

    if (!submittedPassword) {
      throw new AppError(400, 'Enter the second password.');
    }

    if (!codesMatch(submittedPassword, password)) {
      throw new AppError(401, 'Invalid second password.');
    }

    res.json({
      success: true,
      data: issueRoshanToken(password),
      message: 'Roshan access verified.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/verify-roshan', (req, res, next) => {
  try {
    const { password } = getRoshanConfig();
    const token = readBearerToken(req.header('authorization'));

    if (!token) {
      throw new AppError(401, 'Missing Roshan access token.');
    }

    res.json({
      success: true,
      data: verifyRoshanToken(token, password),
      message: 'Roshan access is valid.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
