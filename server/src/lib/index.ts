import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { RefreshPayload } from '../resolvers/mutation/auth';

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

export async function createRefreshToken(user: User): Promise<string> {
  const expiresIn = process.env.REFRESH_TOKEN_LIFETIME ?? '7d';
  const token = await jwt.sign(
    {
      userId: user.id,
      expiresIn,
    },
    process.env.REFRESH_SECRET ?? '',
  );
  return token;
}

export async function validateRefreshToken(
  jot: string,
): Promise<RefreshPayload> {
  try {
    const payload = await jwt.verify(jot, process.env.REFRESH_SECRET ?? '');
    return payload as RefreshPayload;
  } catch (err) {
    throw err;
  }
}

export const REFRESH_TOKEN_KEY = 'rftid';

export function setRefreshToken(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_KEY, token);
}
