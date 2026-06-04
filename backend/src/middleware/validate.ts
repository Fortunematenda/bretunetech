import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../lib/errors';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);

      // Express 5 can expose getter-only req.query/req.params.
      // Define an own property to safely shadow accessor and keep sanitized defaults.
      Object.defineProperty(req, source, {
        value: data,
        writable: true,
        enumerable: true,
        configurable: true,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.issues.forEach((e) => {
          const path = e.path.join('.');
          if (!errors[path]) errors[path] = [];
          errors[path].push(e.message);
        });
        next(new ValidationError(errors));
      } else {
        next(err);
      }
    }
  };
}
