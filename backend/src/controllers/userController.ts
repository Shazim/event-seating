import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { CreateUserRequest, UserResponse, UsersResponse } from '../types/user';
import { ApiResponse } from '../types/api';
import { createError } from '../middleware/errorHandler';

export class UserController {
  constructor(private userService: UserService) {}

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      if (!idParam) {
        throw createError('User ID parameter is required.', 400);
      }
      
      const userId = parseInt(idParam, 10);
      
      if (isNaN(userId) || userId <= 0) {
        throw createError('Invalid user ID. Must be a positive integer.', 400);
      }

      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        throw createError(`User with ID ${userId} not found.`, 404);
      }

      const response: UserResponse = {
        success: true,
        data: user,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email } = req.body as CreateUserRequest;

      // Validation
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw createError('Name is required and must be a non-empty string.', 400);
      }

      if (!email || typeof email !== 'string' || !this.isValidEmail(email)) {
        throw createError('Valid email is required.', 400);
      }

      const userData: CreateUserRequest = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };

      const newUser = await this.userService.createUser(userData);

      const response: UserResponse = {
        success: true,
        data: newUser,
        message: 'User created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
