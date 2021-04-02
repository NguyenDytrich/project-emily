import { User } from '../../src/models';
import { signup } from '../../src/resolvers/mutation/auth';
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
});
