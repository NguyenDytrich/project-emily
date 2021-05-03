import 'reflect-metadata';
import { initialize, User } from './models';
import { resolvers } from './resolvers';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import {
  createAuthToken,
  createRefreshToken,
  setRefreshToken,
  validateTokenPair,
} from './lib';
import { AuthResponse } from './resolvers/mutation/auth';

dotenv.config();

// Entrypoint
(async () => {
  // TODO use dotenv to configure
  // Initialize Postgres connection
  await initialize('postgres://testsuper@localhost:5432/test');

  // Build the schema
  const schema = await buildSchema({
    resolvers,
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

  app.get('/refresh_token', async (req, res) => {
    // Validate the refresh token
    const refreshToken: string | null = req.cookies.rftid;
    const accessToken = req.headers['authorization']?.split(' ')[1] ?? null;

    // Need to have both refresh and an expired access token
    if (!refreshToken || !accessToken) {
      return res.sendStatus(403);
    }

    const { valid, refreshPayload, accessPayload } = validateTokenPair(
      refreshToken,
      accessToken,
    );

    if (!valid || !refreshPayload || !accessPayload) {
      return res.sendStatus(403);
    }

    // TODO: this is validation logic. This can go into validateTokenPair?
    // TODO: Can maybe use caching in future to scale?
    const user = await User.scope('auth').findByPk(accessPayload.userId);
    if (!user) {
      return res.sendStatus(404);
    }

    if (user.sid == refreshPayload.uuid) {
      // if the refresh token is valid, and the payload identifier is valid
      // then send a new auth token and refresh token.
      const authToken = await createAuthToken(user);
      const newRefreshToken = await createRefreshToken(user);

      // Send our repsonses
      setRefreshToken(res, newRefreshToken);
      return res.send(JSON.stringify(new AuthResponse(authToken)));
    } else {
      return res.sendStatus(403);
    }
  });

  // Set up Apollo with our schema
  const server = new ApolloServer({
    schema,
    // Map the { req, res } from express to our GraphQL context
    context: ({ req, res }) => ({ req, res }),
  });

  server.applyMiddleware({ app, cors: false });

  // Go live
  app.listen(4000, () => {
    console.log('Server live at localhost:4000');
    console.log(`GraphQL live at localhost:4000${server.graphqlPath}`);
  });
})();

export {};
