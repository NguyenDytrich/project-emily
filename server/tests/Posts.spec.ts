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
  await users.purge();
  sequelize.close();
});

describe('Association tests', () => {
  let delta = new Delta();
  beforeEach(() => {
    delta = new Delta();
    delta.insert('Hello world');
  });
  afterEach(async () => {
    return Post.destroy({
      truncate: true,
    });
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
  it('Users should have getPosts association mixin', async () => {
    const user = users.first;
    const { id } = await user.createPost({ delta });

    const posts = await user.getPosts();

    expect(posts.length).toEqual(1);
    expect(posts[0].id).toEqual(id);
  });
  it('Should store and retrieve deltas', async () => {
    const user = users.first;
    const post = await user.createPost({ delta });

    expect(new Delta(post.delta)).toEqual(delta);
  });
});
