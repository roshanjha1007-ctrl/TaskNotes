import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // Express requires 4-arg signature for error middleware
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Known operational error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: { requestId: req.requestId },
    });
    return;
  }

  // Prisma record not found
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({ success: false, message: 'Resource not found.', errors: { requestId: req.requestId } });
    return;
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, message: 'Invalid data provided.', errors: { requestId: req.requestId } });
    return;
  }

  // Unexpected errors — don't leak internals
  console.error(`[Unhandled Error][${req.requestId}]`, err);
  res.status(500).json({ success: false, message: 'Internal server error.', errors: { requestId: req.requestId } });
}
