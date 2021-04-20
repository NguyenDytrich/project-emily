import { AuthChecker } from 'type-graphql';
import AppContext from './AppContext';
import jwt from 'jsonwebtoken';

const authChecker: AuthChecker<AppContext> = ({
  context: { req },
}): boolean => {
  const auth = req.headers.authorization;
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
