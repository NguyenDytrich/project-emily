import jwt from 'jsonwebtoken';
import { User } from '../models';

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PasswordError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function createAuthToken(user: User): Promise<string> {
  const expiresIn = process.env.AUTH_TOKEN_LIFETIME ?? '5m';
  const token = await jwt.sign(
    {
      userId: user.id,
      expiresIn,
    },
    process.env.APP_SECRET ?? '',
  );
  return token;
}

export async function createRefreshToken(): Promise<string> {
  const expiresIn = process.env.REFRESH_TOKEN_LIFETIME ?? '7d';
  const token = await jwt.sign(
    {
      expiresIn,
    },
    process.env.REFRESH_SECRET ?? '',
  );
  return token;
}
