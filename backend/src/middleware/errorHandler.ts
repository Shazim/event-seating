import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types/api';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  // Log error for debugging
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, {
    error: err.message,
    stack: err.stack,
    statusCode,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    message,
    error: err.isOperational ? err.name : 'ServerError',
    timestamp: Date.now(),
  };

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: 'NotFound',
    timestamp: Date.now(),
  };

  res.status(404).json(errorResponse);
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
