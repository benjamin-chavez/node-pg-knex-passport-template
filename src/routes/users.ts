// src/routes/users.ts

import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../../@types/user';
import knex from '../database/db';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

/**
 * @description:    Get all users
 * @route:          GET /api/users
 * @access:         Private/Admin
 */
router.get(
  '/',
  // protect,
  // admin,
  asyncHandler(async (req, res) => {
    const users: User[] = await knex('users');
    res.status(200).json({ message: 'Users retrieved successfully', users });
  })
);

/**
 * @description:    Get current user
 * @route:          GET /api/users/:id
 * @access:         Private
 */
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const user: Partial<User> = req.user;

    res
      .status(200)
      .json({ message: 'User details retrieved successfully', user });
  })
);

export default router;
