import { signup, login } from './mutation/auth';
import { gql } from 'apollo-server';

interface SignupArgs {
  fname: string;
  lname: string;
  email: string;
  password: string;
  passwordConf: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

export const typeDefs = gql`
  type User {
    fname: String
    lname: String
    email: String
    lastLogin: String
  }

  type Query {
    test: String
  }

  type Mutation {
    signup(
      fname: String
      lname: String
      email: String
      password: String
      passwordConf: String
    ): Boolean
    login(email: String, password: String): String
  }
`;

export const resolvers = {
  Query: {
    test: (): string => 'hello',
  },
  Mutation: {
    // @ts-expect-error: This is a top-level resolver, so it doesn't have any parents
    // eslint-disable-next-line
    signup: async (_, args: SignupArgs): Promise<boolean> => {
      try {
        await signup(
          args.fname,
          args.lname,
          args.email,
          args.password,
          args.passwordConf,
        );
        // TODO check that a user was actually created?
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    // @ts-expect-error: This is a top-level resolver, so it doesn't have any parents
    // eslint-disable-next-line
    login: async (_, args: LoginArgs): Promise<string> => {
      console.log(args)
      return await login(args.email, args.password);
    },
  },
};
