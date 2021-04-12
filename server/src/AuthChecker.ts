import { AuthChecker } from 'type-graphql';
import jwt from 'jsonwebtoken';

interface Context {
  auth: string;
}

const authChecker: AuthChecker<Context> = ({ context: { auth } }): boolean => {
  if (!auth) {
    return false;
  }

  const [scheme, token] = auth.split(' ');

  // Other authentication schemes not accepted
  if (scheme !== 'Bearer') {
    return false;
  }

  try {
    jwt.verify(token, process.env.APP_SECRET ?? '');
    return true;
  } catch (err) {
    return false;
  }
};

export default authChecker;
