import 'reflect-metadata';

import { Sequelize } from 'sequelize';
import Delta from 'quill-delta';

import { initialize, User, Post } from '../src/models';
import UserGen from './utils/UserGen';

let sequelize: Sequelize;
let users: UserGen;
beforeAll(async () => {
  try {
    sequelize = await initialize('postgres://testsuper@localhost:5432/test', {
      force: true,
      logging: false,
    });
    users = new UserGen(sequelize);
    await users.create();
  } catch (err) {
    throw err;
  }
});
afterAll(async () => {
  sequelize.close();
});

describe('Association tests', () => {
  let delta = new Delta();
  beforeEach(() => {
    delta = new Delta();
    delta.insert('Hello world');
  });
  it('Users should have createPost association mixin', async () => {
    const user = users.first;

    const { id } = await user.createPost({ delta });
    await user.save();
    const post = await Post.findByPk(id, {
      include: { model: User, as: 'author' },
    });

    expect(post).not.toBe(null);
    expect(post?.author.id).toEqual(user.id);
  });
});
