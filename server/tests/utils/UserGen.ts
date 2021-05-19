import faker from 'faker';
import { User } from '../../src/models';
import { Sequelize } from 'sequelize';

interface CreateArgs {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
}

class UserGen {
  readonly users: User[];

  constructor(readonly sequelize: Sequelize) {
    users = [] as User[];
  }

  public async create(args?: CreateArgs): Promise<User> {
    const user = await User.create({
      fname: args?.fname ?? faker.name.firstName(),
      lname: args?.lname ?? faker.name.lastName(),
      email: args?.email ?? faker.internet.email(),
      password: args?.password ?? 'password',
    });
    users.push(user);
    return user;
  }
}

export default new UserGen() as const;
