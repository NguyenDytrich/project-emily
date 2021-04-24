import 'reflect-metadata';

import { User } from '../../src/models';
import {
  AuthResolver,
  AuthResponse,
  TokenPayload,
} from '../../src/resolvers/mutation/auth';
import { EmailError, PasswordError, UserError } from '../../src/lib';
import AuthChecker from '../../src/AuthChecker';
import { createMockResolverData } from '../utils';
import { createAuthToken, createRefreshToken } from '../../src/lib';
import AppContext from '../../src/AppContext';

// 3rd parties
import bcrypt from 'bcrypt';
import { TokenExpiredError } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError, ValidationErrorItem } from 'sequelize';

// Config test environment
import dotenv from 'dotenv';
dotenv.config();

import { mocked } from 'ts-jest/utils';

// Test suite
jest.mock('../../src/models');

let resolver: AuthResolver;

beforeEach(() => {
  mocked(User).mockClear();
  resolver = new AuthResolver();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const goodSignup = {
  fname: 'fname',
  lname: 'lname',
  email: 'user@test.com',
  password: 'password',
  passwordConf: 'password',
};

describe('User signup', () => {
  it('creates a model instance', async () => {
    const modelCreate = jest.spyOn(User, 'create');
    await resolver.signup(goodSignup);
    expect(modelCreate).toHaveBeenCalled();
  });
  it('hashes the password', async () => {
    const bcryptHash = jest.spyOn(bcrypt, 'hash');
    await resolver.signup(goodSignup);
    expect(bcryptHash).toHaveBeenCalled();
  });
  it('should reject invalid email addresses', async () => {
    expect.hasAssertions();
    try {
      await resolver.signup({
        fname: 'fname',
        lname: 'lname',
        email: 'user(at)test.com',
        password: 'password',
        passwordConf: 'password',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(EmailError);
      expect(e.message).toMatch('Invalid email address');
    }
  });
  it('should reject unconfirmed password', async () => {
    expect.hasAssertions();
    try {
      await resolver.signup({
        fname: 'fname',
        lname: 'lname',
        email: 'user@test.com',
        password: 'password',
        passwordConf: 'mismatched',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(PasswordError);
      expect(e.message).toMatch("Passwords don't match");
    }
  });
  it('should return EmailError with message: "Email already in use" on SequelizeUniqueConstraintError', async () => {
    User.create = jest.fn().mockImplementation(() => {
      const err = new UniqueConstraintError({
        errors: [new ValidationErrorItem('msg', 'unique violation', 'email')],
      });
      throw err;
    });

    expect.hasAssertions();
    try {
      await resolver.signup({
        fname: 'fname',
        lname: 'lname',
        email: 'user@test.com',
        password: 'password',
        passwordConf: 'password',
      });
    } catch (e) {
      expect(e).toBeInstanceOf(EmailError);
      expect(e.message).toMatch('Email already in use');
    }
  });
});

describe('User login', () => {
  let mockResolverData;
  let context: AppContext;
  const setCookie = jest.fn();
  beforeEach(() => {
    mockResolverData = createMockResolverData();
    context = mockResolverData.context;
    context.res.cookie = setCookie;

    setCookie.mockClear();
  });

  it('returns the an AuthResponse on successful authentication', async () => {
    jest.spyOn(User, 'scope').mockReturnValue(User);
    jest.spyOn(User, 'findOne').mockResolvedValue(new User());
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const returnedVal = await resolver.login(
      'user@test.com',
      'password',
      context,
    );
    expect(returnedVal).toBeInstanceOf(AuthResponse);
    expect(setCookie).toHaveBeenCalled();
  });
  it('tries to retrieve the User from the database', async () => {
    const modelScope = jest.spyOn(User, 'scope').mockReturnValue(User);
    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(new User());

    // Empty catch since bcrypt validation will just fail.
    // We're just making sure the method is called.
    try {
      await resolver.login('user@test.com', 'password', context);
    } catch (e) {}

    // Login method should be using the 'auth' scope
    expect(modelScope.mock.calls[0][0]).toBe('auth');
    expect(modelFind).toHaveBeenCalled();
  });
  it('verifies the password against the hash with BCrypt', async () => {
    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(new User());
    const bcryptVal = jest.spyOn(bcrypt, 'compare');
    // Empty catch since bcrypt validation will just fail.
    // We're just making sure the method is called.
    try {
      await resolver.login('user@test.com', 'password', context);
    } catch (e) {}
    expect(bcryptVal).toHaveBeenCalled();
    expect(modelFind).toHaveBeenCalled();
  });
  it('throws PasswordError if the function does not match', async () => {
    expect.hasAssertions();

    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(new User());
    const bcryptVal = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    try {
      await resolver.login('user@test.com', 'password', context);
    } catch (e) {
      expect(modelFind).toHaveBeenCalled();
      expect(bcryptVal).toHaveBeenCalled();
      expect(setCookie).not.toHaveBeenCalled();
      expect(e).toBeInstanceOf(PasswordError);
      expect(e.message).toMatch('Invalid password');
    }
  });
  it('throws UserError if no user is found', async () => {
    expect.hasAssertions();

    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(null);

    try {
      await resolver.login('user@test.com', 'password', context);
    } catch (e) {
      expect(modelFind).toHaveBeenCalled();
      expect(e).toBeInstanceOf(UserError);
      expect(e.message).toMatch("User doesn't exist for 'user@test.com'");
      expect(setCookie).not.toHaveBeenCalled();
    }
  });

  it('logs a user in with correct credentials, returns JWT', async () => {
    const user = new User();
    user.id = 1;

    const bcryptEval = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const modelScope = jest.spyOn(User, 'scope').mockReturnValue(User);
    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(user);
    const jwtSign = jest.spyOn(jwt, 'sign');

    // This should be a JWT
    const returnedVal = await resolver.login(
      'user@test.com',
      'password',
      context,
    );

    expect(bcryptEval).toHaveBeenCalled();

    // The login method should use the 'auth' scope
    expect(modelScope.mock.calls[0][0]).toBe('auth');
    expect(modelFind).toHaveBeenCalled();
    expect(jwtSign).toHaveBeenCalled();
    expect(setCookie).toHaveBeenCalled();

    // Verify the token
    const decoded = (await jwt.verify(
      returnedVal.token,
      process.env.APP_SECRET ?? '',
    )) as TokenPayload;

    // User ID should be present in the payload
    expect(decoded.userId).toEqual(user.id);
  });
  it.todo('locks a user out of log-in on too many password attempts');
});

describe('AuthChecker', () => {
  it('Verifies the auth token when "Bearer" scheme is used', () => {
    // Mock jwt.verify to return a dummy payload
    const jwtVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      return {
        key: 'value',
      };
    });

    // Mock the request context
    const resolverData = createMockResolverData({ auth: 'Bearer asdfjkl' });

    // When jwt.verify succeeds, the request should be authorized
    expect(AuthChecker(resolverData, [''])).toBe(true);
    expect(jwtVerify).toHaveBeenCalled();
  });

  it('Returns false if the JWT is not valid', () => {
    const jwtVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error();
    });
    const resolverData = createMockResolverData({ auth: 'Bearer asdfjkl' });

    expect(AuthChecker(resolverData, [''])).toBe(false);
    expect(jwtVerify).toHaveBeenCalled();
  });

  it('Returns false if the JWT is expired', () => {
    const jwtVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new TokenExpiredError('jwt expired', new Date());
    });
    const resolverData = createMockResolverData({ auth: 'Bearer asdfjkl' });

    expect(AuthChecker(resolverData, [''])).toBe(false);
    expect(jwtVerify).toHaveBeenCalled();
  });

  it('Returns false if no auth is provided', () => {
    const resolverData = createMockResolverData();
    expect(AuthChecker(resolverData, [''])).toBe(false);
  });

  it('Returns false if another auth scheme is provided', () => {
    const resolverData = createMockResolverData({ auth: 'Basic asdfjkl' });
    expect(AuthChecker(resolverData, [''])).toBe(false);
  });
});

describe('Token generation', () => {
  it('Signs auth tokens', async () => {
    const user = new User();
    user.id = 1;

    const jwtSign = jest.spyOn(jwt, 'sign');
    const token = await createAuthToken(user);

    expect(jwtSign).toHaveBeenCalled();
    const payload = (await jwt.verify(
      token,
      process.env.APP_SECRET ?? '',
    )) as TokenPayload;

    expect(payload.userId).toEqual(user.id);
  });
  it('Signs refresh tokens with a different secret', async () => {
    const jwtSign = jest.spyOn(jwt, 'sign');
    const token = await createRefreshToken();

    expect(jwtSign).toHaveBeenCalled();
    jwt.verify(token, process.env.REFRESH_SECRET ?? '');
  });
});

describe('Refresh token', () => {
  it.todo('Returns nothing when passed an invalid refresh token');
  it.todo('Returns a valid JWT access token when passed a valid refresh token');
});
