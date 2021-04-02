import { User } from '../../src/models';
import {
  EmailError,
  signup,
  PasswordError,
} from '../../src/resolvers/mutation/auth';
import bcrypt from 'bcrypt';

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
  it.todo('should reject duplicate email addresses');
});

describe('User retrieval', () => {
  it.todo('instances should not have password information on retrieval');
});
