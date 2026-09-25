import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const registerService = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}): Promise<any> => {
  const { name, email, password, phone, role = 'CITIZEN' } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone: phone || undefined,
      role,
    },
  });

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const loginService = async (data: { email: string; password: string }): Promise<any> => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
    },
  });
};

export const getPoliceOfficers = async () => {
  return await prisma.user.findMany({
    where: { role: 'POLICE' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
};