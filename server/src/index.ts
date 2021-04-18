import 'reflect-metadata';
import { initialize } from './models';
import authChecker from './AuthChecker';
import { resolvers } from './resolvers';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

// Entrypoint
(async () => {
  // TODO use dotenv to configure
  // Initialize Postgres connection
  await initialize('postgres://testsuper@localhost:5432/test');

  // Build the schema
  const schema = await buildSchema({
    resolvers,
    authChecker,
  });

  // Express configuration
  const app = express();
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.get('/ping', (_, res) => res.send('pong'));

  // Set up Apollo with our schema
  const server = new ApolloServer({
    schema,
    // Map the { req, res } from express to our GraphQL context
    context: ({ req, res }) => ({ req, res }),
  });

  server.applyMiddleware({ app, cors: false });

  // Go live
  await app.listen(4000, () => {
    console.log('Server live at localhost:4000');
    console.log(`GraphQL live at localhost:4000${server.graphqlPath}`);
  });
})();

export {};
