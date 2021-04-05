import { User } from '../../src/models';
import {
  login,
  signup,
  EmailError,
  PasswordError,
  UserError,
} from '../../src/resolvers/mutation/auth';

import bcrypt from 'bcrypt';
import {
  UniqueConstraintError,
  ValidationError,
  ValidationErrorItem,
} from 'sequelize';

jest.mock('../../src/models');

beforeAll(() => {
  User.mockClear();
});

describe('User signup', () => {
  it('creates a model instance', async () => {
    const modelCreate = jest.spyOn(User, 'create');
    await signup('fname', 'lname', 'user@test.com', 'password', 'password');
    expect(modelCreate).toHaveBeenCalled();
  });
  it('hashes the password', async () => {
    const bcryptHash = jest.spyOn(bcrypt, 'hash');
    await signup('fname', 'lname', 'user@test.com', 'password', 'password');
    expect(bcryptHash).toHaveBeenCalled();
  });
  it('should reject invalid email addresses', async () => {
    expect.hasAssertions();
    try {
      await signup(
        'fname',
        'lname',
        'user(at)test.com',
        'password',
        'password',
      );
    } catch (e) {
      expect(e).toBeInstanceOf(EmailError);
      expect(e.message).toMatch('Invalid email address');
    }
  });
  it('should reject unconfirmed password', async () => {
    expect.hasAssertions();
    try {
      await signup('fname', 'lname', 'user@test.com', 'password', 'mismatched');
    } catch (e) {
      expect(e).toBeInstanceOf(PasswordError);
      expect(e.message).toMatch("Passwords don't match");
    }
  });
  it('should return EmailError with message: "Email already in use" on SequelizeUniqueConstraintError', async () => {
    User.create = jest.fn().mockImplementation(() => {
      const err = new UniqueConstraintError();
      (err as ValidationError).errors = [
        new ValidationErrorItem('msg', 'unique violation', 'email'),
      ];
      throw err;
    });

    expect.hasAssertions();
    try {
      await signup('fname', 'lname', 'user@test.com', 'password', 'password');
    } catch (e) {
      expect(e).toBeInstanceOf(EmailError);
      expect(e.message).toMatch('Email already in use');
    }
  });
});

describe('User login', () => {
  it('tries to retrieve the User from the database', async () => {
    const modelFind = jest.spyOn(User, 'findOne');
    await login('user@test.com', 'password');
    expect(modelFind).toHaveBeenCalled();
  });
  it('verifies the password against the hash with BCrypt', async () => {
    const bcryptVal = jest.spyOn(bcrypt, 'compare');
    await login('user@test.com', 'password');
    expect(bcryptVal).toHaveBeenCalled();
  });
  it('throws PasswordError if the function does not match', async () => {
    expect.hasAssertions();
    const bcryptVal = jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => false);
    try {
      await login('user@test.com', 'password');
    } catch (e) {
      expect(bcryptVal).toHaveBeenCalled();
      expect(e).toBeInstanceOf(PasswordError);
      expect(e.message).toMatch('Invalid password');
    }
  });
  it('throws UserError if no user is found', async () => {
    expect.hasAssertions();
    const modelFind = jest
      .spyOn(User, 'findOne')
      .mockImplementation(() => null);
    try {
      await login('user@test.com', 'password');
    } catch (e) {
      expect(modelFind).toHaveBeenCalled();
      expect(e).toBeInstanceOf(UserError);
      expect(e.message).toMatch("User doesn't exist for 'user@test.com'");
    }
  });

  it.todo('logs a user in with correct credentials');
  it.todo('instances should not have password information on retrieval');
  it.todo('creates a session for the user');
  it.todo('locks a user out of log-in on too many password attempts');
});
