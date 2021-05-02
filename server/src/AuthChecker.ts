import { MiddlewareFn } from 'type-graphql';
import AppContext from './AppContext';
import jwt from 'jsonwebtoken';

const authChecker: MiddlewareFn<AppContext> = ({ context }, next) => {
  const { req } = context;
  const auth = req?.headers.authorization;

  if (!auth) {
    throw new Error('No authorization provided');
  }

  const [scheme, token] = auth.split(' ');

  // Other authentication schemes not accepted
  if (scheme !== 'Bearer') {
    throw new Error('Invalid authorization scheme');
  }

  try {
    jwt.verify(token, process.env.APP_SECRET ?? '');
  } catch (err) {
    // Invalid token
    throw new Error('Invalid token');
  }

  return next();
};

export default authChecker;
