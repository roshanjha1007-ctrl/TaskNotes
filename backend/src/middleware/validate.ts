import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Runs a chain of express-validator rules, then short-circuits with a 422
 * if any rule failed — returning a structured error map.
 */
export function validate(chains: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const chain of chains) {
      await chain.run(req);
    }

    const result = validationResult(req);
    if (!result.isEmpty()) {
      const errors: Record<string, string> = {};
      for (const err of result.array()) {
        if (err.type === 'field') {
          errors[err.path] = err.msg as string;
        }
      }
      res.status(422).json({ success: false, message: 'Validation failed.', errors });
      return;
    }

    next();
  };
}
