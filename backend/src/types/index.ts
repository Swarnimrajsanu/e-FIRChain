import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
  userId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'POLICE' | 'ADMIN';
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'CITIZEN' | 'POLICE' | 'ADMIN';
}

export interface LoginInput {
  email: string;
  password: string;
}