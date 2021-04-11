import 'reflect-metadata';
import { initialize } from './models';
import { resolvers } from './resolvers';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server';
import dotenv from 'dotenv';

dotenv.config();

// TODO use dotenv to configure
// Initialize Postgres connection
initialize('postgres://testsuper@localhost:5432/test').then(async () => {
  const schema = await buildSchema({
    resolvers: [resolvers[0]],
  });

  const server = new ApolloServer({
    schema,
  });

  await server.listen();
  console.log('Server live at localhost:4000');
});

export {};
