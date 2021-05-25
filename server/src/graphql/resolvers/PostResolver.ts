import {
  Resolver,
  Query,
  Arg,
  UseMiddleware,
  Mutation,
  Ctx,
  Field,
  InputType,
} from 'type-graphql';

import Delta from 'quill-delta';
import { User, Post } from '../../models';
import AppContext from '../../AppContext';
import AuthChecker from '../../AuthChecker';
import { DeltaScalar } from '../scalar';

@Resolver()
export default class PostResolver {
  @Mutation(() => Post)
  @UseMiddleware(AuthChecker)
  public async createPost(
    // TODO Create a Delta scalar type
    @Arg('delta', (type) => DeltaScalar) delta: Delta,
    @Ctx() ctx: AppContext,
  ): Promise<Post> {
    const user = await User.findByPk(ctx.payload?.userId);
    if (!user) throw new Error('Unauthorized');
    const post = await user.createPost({ delta });
    post.author = user;
    return post;
  }

  // Untested
  @Query(() => [Post])
  public async posts(): Promise<Post[]> {
    const posts = await Post.findAll({ include: { all: true } });
    return posts;
  }
}
