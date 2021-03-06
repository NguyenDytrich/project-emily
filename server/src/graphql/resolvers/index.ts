import { AuthResolver } from './AuthResolver';
import CalendarEventResolver from './CalendarEventResolver';
import PostResolver from './PostResolver';

import { Resolver, Query } from 'type-graphql';

/**
 * A test resolver class to put a Query in so that
 * the SDL compiles correctly for now.
 *
 * 04/11/21
 */
@Resolver()
class TempResolver {
  @Query((returns) => String)
  hello(): string {
    return 'Hello world.';
  }
}

export const resolvers = [
  AuthResolver,
  TempResolver,
  PostResolver,
  CalendarEventResolver,
] as const;
