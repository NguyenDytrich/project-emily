import { initialize } from './models';
import { ApolloServer } from 'apollo-server';
import { typeDefs, resolvers } from './resolvers';
import dotenv from 'dotenv';

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// TODO use dotenv to configure
// Initialize Postgres connection
initialize('postgres://testsuper@localhost:5432/test').then(async () => {
  await server.listen();
  console.log(`Server is running. Listening on port 4000.`);
});

export {};
