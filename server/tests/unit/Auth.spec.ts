import 'reflect-metadata';

import { User } from '../../src/models';
import {
  AuthResolver,
  AuthResponse,
  EmailError,
  PasswordError,
  UserError,
} from '../../src/resolvers/mutation/auth';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UniqueConstraintError, ValidationErrorItem } from 'sequelize';

import dotenv from 'dotenv';
dotenv.config();

import { mocked } from 'ts-jest/utils';

jest.mock('../../src/models');

let resolver: AuthResolver;

beforeEach(() => {
  mocked(User).mockClear();
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

    // This should be a JWT
    const returnedVal = await resolver.login('user@test.com', 'password');

    expect(bcryptEval).toHaveBeenCalled();

    // The login method should use the 'auth' scope
    expect(modelScope.mock.calls[0][0]).toBe('auth');
    expect(modelFind).toHaveBeenCalled();
    expect(jwtSign).toHaveBeenCalled();

    // Verify the token
    const decoded = await jwt.verify(
      returnedVal.token,
      process.env.APP_SECRET ?? '',
    );

    expect((decoded as { userId: string }).userId).toEqual(1);
  });
  it.todo('locks a user out of log-in on too many password attempts');
});
