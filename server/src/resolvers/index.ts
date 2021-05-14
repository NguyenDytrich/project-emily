import { AuthResolver } from './mutation/auth';
import CalendarEventResolver from './CalendarEventResolver';

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
  CalendarEventResolver,
] as const;
