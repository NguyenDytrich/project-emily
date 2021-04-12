import 'reflect-metadata';

import { User, RefreshToken } from '../../src/models';
import {
  AuthResolver,
  AuthResponse,
  EmailError,
  PasswordError,
  TokenPayload,
  UserError,
} from '../../src/resolvers/mutation/auth';

import AuthChecker from '../../src/AuthChecker';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError, ValidationErrorItem } from 'sequelize';
import { validate as uuidValidate } from 'uuid';
import { version as uuidVersion } from 'uuid';
import { ResolverData } from 'type-graphql';

import dotenv from 'dotenv';
dotenv.config();

import { mocked } from 'ts-jest/utils';
import mockito from 'ts-mockito';

jest.mock('../../src/models');

let resolver: AuthResolver;

beforeEach(() => {
  mocked(User).mockClear();
  mocked(RefreshToken).mockClear();
  resolver = new AuthResolver();
});

describe('User signup', () => {
  it('creates a model instance', async () => {
    const modelCreate = jest.spyOn(User, 'create');
    await resolver.signup({
      fname: 'fname',
      lname: 'lname',
      email: 'user@test.com',
      password: 'password',
      passwordConf: 'password',
    });
    expect(modelCreate).toHaveBeenCalled();
  });
  it('hashes the password', async () => {
    const bcryptHash = jest.spyOn(bcrypt, 'hash');
    await resolver.signup({
      fname: 'fname',
      lname: 'lname',
      email: 'user@test.com',
      password: 'password',
      passwordConf: 'password',
    });
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
  it('returns the an AuthResponse on successful authentication', async () => {
    jest.spyOn(User, 'scope').mockReturnValue(User);
    jest.spyOn(User, 'findOne').mockResolvedValue(new User());
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const returnedVal = await resolver.login('user@test.com', 'password');
    expect(returnedVal).toBeInstanceOf(AuthResponse);
  });
  it('tries to retrieve the User from the database', async () => {
    const modelScope = jest.spyOn(User, 'scope').mockReturnValue(User);
    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(new User());

    // Empty catch since bcrypt validation will just fail.
    // We're just making sure the method is called.
    try {
      await resolver.login('user@test.com', 'password');
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
      await resolver.login('user@test.com', 'password');
    } catch (e) {}
    expect(bcryptVal).toHaveBeenCalled();
    expect(modelFind).toHaveBeenCalled();
  });
  it('throws PasswordError if the function does not match', async () => {
    expect.hasAssertions();

    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(new User());
    const bcryptVal = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
    try {
      await resolver.login('user@test.com', 'password');
    } catch (e) {
      expect(modelFind).toHaveBeenCalled();
      expect(bcryptVal).toHaveBeenCalled();
      expect(e).toBeInstanceOf(PasswordError);
      expect(e.message).toMatch('Invalid password');
    }
  });
  it('throws UserError if no user is found', async () => {
    expect.hasAssertions();

    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(null);

    try {
      await resolver.login('user@test.com', 'password');
    } catch (e) {
      expect(modelFind).toHaveBeenCalled();
      expect(e).toBeInstanceOf(UserError);
      expect(e.message).toMatch("User doesn't exist for 'user@test.com'");
    }
  });

  it('logs a user in with correct credentials, returns JWT', async () => {
    const user = new User();
    user.id = 1;

    const bcryptEval = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const modelScope = jest.spyOn(User, 'scope').mockReturnValue(User);
    const modelFind = jest.spyOn(User, 'findOne').mockResolvedValue(user);
    const jwtSign = jest.spyOn(jwt, 'sign');
    const refreshCreate = jest.spyOn(RefreshToken, 'create');
    refreshCreate.mockClear();

    // This should be a JWT
    const returnedVal = await resolver.login('user@test.com', 'password');

    expect(bcryptEval).toHaveBeenCalled();

    // The login method should use the 'auth' scope
    expect(modelScope.mock.calls[0][0]).toBe('auth');
    expect(refreshCreate.mock.calls[0][0].userId).toEqual(user.id);
    expect(modelFind).toHaveBeenCalled();
    expect(jwtSign).toHaveBeenCalled();

    // Verify the token
    const decoded = (await jwt.verify(
      returnedVal.token,
      process.env.APP_SECRET ?? '',
    )) as TokenPayload;

    // User ID should be present in the payload
    expect(decoded.userId).toEqual(user.id);
    expect(decoded.userId).toEqual(refreshCreate.mock.calls[0][0].userId);

    // JWT refresh token should be a UUID created using uuid.v4()
    expect(uuidValidate(decoded.refreshToken)).toBe(true);
    expect(uuidVersion(decoded.refreshToken)).toBe(4);
    // The stored token should be the same as the one that's returned in the payload.
    expect(decoded.refreshToken).toEqual(refreshCreate.mock.calls[0][0].token);
  });
  it.todo('locks a user out of log-in on too many password attempts');
});

interface Context {
  auth: string;
}

describe('AuthChecker', () => {
  it('Verifies the auth token when "Bearer" scheme is used', () => {
    // Mock jwt.verify to return a dummy payload
    const jwtVerify = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      return {
        key: 'value',
      };
    });

    // Mock the request context
    const mResolverData = mockito.mock<ResolverData<Context>>();
    mockito.when(mResolverData.context).thenReturn({ auth: 'Bearer asdfasdf' });
    const resolverData: ResolverData<Context> = mockito.instance(mResolverData);

    // When jwt.verify succeeds, the request should be authorized
    expect(jwtVerify).toHaveBeenCalled();
    expect(AuthChecker(resolverData, [''])).toBe(true);
  });
  it.todo('Returns false if the JWT is not valid');
  it.todo('Returns false if the JWT is expired');
  it('Returns false if no auth is provided', () => {
    const mResolverData = mockito.mock<ResolverData<Context>>();
    mockito.when(mResolverData.context).thenReturn({ auth: '' });
    const resolverData: ResolverData<Context> = mockito.instance(mResolverData);
    expect(AuthChecker(resolverData, [''])).toBe(false);
  });
  it('Returns false if another auth scheme is provided', () => {
    const mResolverData = mockito.mock<ResolverData<Context>>();
    mockito.when(mResolverData.context).thenReturn({ auth: 'Basic asdfasdf' });
    const resolverData: ResolverData<Context> = mockito.instance(mResolverData);
    expect(AuthChecker(resolverData, [''])).toBe(false);
  });
});
