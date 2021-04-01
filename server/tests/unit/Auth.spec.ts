import { User } from '../../src/models'
import { signup } from '../../src/resolvers/mutation/auth'
import bcrypt from 'bcrypt'

describe('Create user tests', () => {
  test('Sequelize model instance is created', async () => {
    // Sequelize create method should be called
    const modelCreate = jest.spyOn(User, 'create');

    // BCrypt hash function should be called
    const bcryptHash = jest.spyOn(bcrypt, 'hash');

    await signup();

    expect(modelCreate).toHaveBeenCalled();
    expect(bcryptHash).toHaveBeenCalled();
  });
});
