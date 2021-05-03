import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AuthPayload, RefreshPayload } from '../resolvers/mutation/auth';

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

/**
 * Verifies a refresh token and access token pair, ignoring the expiration of
 * the access token. This method serves to validate that both tokens originated
 * from our server when refreshing tokens.
 * @param {string} refresh A JWT token signed with the REFRESH_SECRET
 * @param {string} access A JWT token signed with the APP_SECRET
 * @returns {boolean} valid Whether or not the tokens are valid
 * @returns {RefreshPayload} refreshPayload If the token is valid, returns the payload
 * @returns {AuthPayload} refreshPayload If the token is valid, returns the payload
 */
export function validateTokenPair(
  refresh: string,
  access: string,
): {
  valid: boolean;
  accessPayload?: AuthPayload;
  refreshPayload?: RefreshPayload;
} {
  try {
    const refreshPayload = jwt.verify(
      refresh,
      process.env.REFRESH_SECRET ?? '',
    ) as RefreshPayload;

    const accessPayload = jwt.verify(access, process.env.APP_SECRET ?? '', {
      ignoreExpiration: true,
    }) as AuthPayload;
    // If refresh and access are valid tokens...
    return {
      valid: true,
      refreshPayload,
      accessPayload,
    };

    // TODO?
    // find a refresh payload by uuid
    // refreshPayload.uuid
    // then verify the accessPayload.userId against it ?
    // this can be cached in Redis as application scales
  } catch (err) {
    return { valid: false };
  }
}

export const REFRESH_TOKEN_KEY = 'rftid';

export function setRefreshToken(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_KEY, token);
}
