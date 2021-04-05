import { User } from '../../src/models';
import {
  EmailError,
  signup,
  PasswordError,
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
  it.todo('verifies the password against the hash with BCrypt');
  it.todo('logs a user in with correct credentials');
  it.todo('instances should not have password information on retrieval');
  it.todo('creates a session for the user');
  it.todo('locks a user out of log-in on too many password attempts');
});
