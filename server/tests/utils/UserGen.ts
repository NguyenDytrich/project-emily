import faker from 'faker';
import { User } from '../../src/models';
import { Sequelize } from 'sequelize';

interface CreateArgs {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
}

export default class UserGen {
  public readonly users: User[];

  constructor(readonly sequelize: Sequelize) {
    this.users = [] as User[];
  }

  public async create(args?: CreateArgs): Promise<User> {
    const user = await User.create({
      fname: args?.fname ?? faker.name.firstName(),
      lname: args?.lname ?? faker.name.lastName(),
      email: args?.email ?? faker.internet.email(),
      password: args?.password ?? 'password',
    });
    await user.save();
    this.users.push(user);
    return user;
  }

  public get first(): User {
    if (!this.users[0]) {
      throw new Error('No users generated yet');
    }
    return this.users[0];
  }
}
