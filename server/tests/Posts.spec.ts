import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';
import Delta from 'quill-delta';
import { initialize, User, Post } from '../src/models';

import UserGen from './utils/UserGen';
import { createMockResolverData } from './utils/utils';

import PostResolver from '../src/graphql/resolvers/PostResolver';

let sequelize: Sequelize;
let users: UserGen;
beforeAll(async () => {
  try {
    sequelize = await initialize(process.env.DB_URL ?? '', {
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
  it('Posts should have getAuthor association mixin', async () => {
    const user = users.first;
    const post = await user.createPost({ delta });

    const author = await post.getAuthor();

    expect(author).toBeInstanceOf(User);
    expect(author.id).toEqual(user.id);
  });
});

describe('Resolver tests', () => {
  let delta = new Delta();
  const resolver = new PostResolver();
  beforeEach(() => {
    delta = new Delta();
    delta.insert('Hello world');
  });
  afterEach(async () => {
    return Post.destroy({
      truncate: true,
    });
  });

  it('Should create a post', async () => {
    const { context } = createMockResolverData({
      payload: { userId: users.first.id },
    });

    const post = await resolver.createPost(delta, context);

    const { count, rows: posts } = await Post.findAndCountAll();

    expect(post).toBeInstanceOf(Post);
    expect(count).toEqual(1);
    expect(posts[0].id).toEqual(post.id);
  });

  it.each([{}, { payload: { userId: 1000 } }])(
    'Should not create a post with invalid payload',
    async (testCase) => {
      const { context } = createMockResolverData(testCase);

      expect.hasAssertions();
      try {
        await resolver.createPost(delta, context);
      } catch (err) {
        const posts = await Post.findAll();
        expect(err.message).toBe('Unauthorized');
        expect(posts.length).toBe(0);
      }
    },
  );
});
