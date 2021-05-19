import faker from 'faker';
import { User } from '../../src/models';
import { Sequelize } from 'sequelize';

interface CreateArgs {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
}

abstract class Generator<T> {
  protected instances: T[];

  constructor(readonly sequelize: Sequelize) {
    this.instances = [] as T[];
  }

  public get first(): T {
    if (!this.instances[0]) {
      throw new Error(`No instances created`);
    }
    return this.instances[0];
  }

  abstract create(): Promise<T>;

  abstract purge(): Promise<void>;
}

export default class UserGen extends Generator<User> {
  constructor(sequelize: Sequelize) {
    super(sequelize);
  }

  public async create(args?: CreateArgs): Promise<User> {
    const user = await User.create({
      fname: args?.fname ?? faker.name.firstName(),
      lname: args?.lname ?? faker.name.lastName(),
      email: args?.email ?? faker.internet.email(),
      password: args?.password ?? 'password',
    });
    await user.save();
    this.instances.push(user);
    return user;
  }

  public async purge(): Promise<void> {
    await User.destroy({ truncate: true, cascade: true });
  }
}
