// src/middleware/authMiddleware.ts

import asyncHandler from 'express-async-handler';
import { Request } from 'express';

export const protect = asyncHandler(async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401);
  throw new Error('Not authorized');
});

export const admin = asyncHandler(async (req: Request, res, next) => {
  // @ts-ignore
  if (req.user && req.user.isAdmin) {
    return next();
  }

  res.status(401);
  throw new Error('Not authorized as Admin');
});
