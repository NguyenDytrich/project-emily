import { User } from '../../models';
import { ObjectType, InputType, Field, Resolver, Mutation, Arg } from 'type-graphql';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class EmailError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PasswordError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UserError extends Error {
  constructor(message: string) {
    super(message);
  }
}

@InputType()
class UserSignupInput {
  @Field()
  fname!: string;

  @Field()
  lname!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  passwordConf!: string;
}

@ObjectType()
class AuthResponse {
  @Field()
  token: string;
}

@Resolver()
export class AuthResolver {
  /**
   * Creates a user instance with a hashed password.
   * @param {string} fname User's first name
   * @param {string} lname User's last name
   * @param {string} email User's email
   * @param {string} password User's password
   * @param {string} passwordConf User's password confirmation
   * @returns {User} The newly created user reference
   * @throws {PasswordError} When the password does not match the confirmation
   * @throws {EmailError} When the email is not valid
   */
  @Mutation((returns) => User)
  async signup(@Arg('user') user: UserSignupInput): Promise<User> {
    const { fname, lname, email, password, passwordConf } = user;

    if (password !== passwordConf) {
      throw new PasswordError("Passwords don't match");
    }

    // TODO or... maybe just use validator js...?
    const RFC2822_EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (!email.match(RFC2822_EMAIL_REGEX)) {
      throw new EmailError('Invalid email address');
    }

    const passwordHash = await bcrypt.hash(
      password,
      process.env.BCRYPT_SALT_ROUNDS ?? 10,
    );

    try {
      const newUser = await User.create({
        fname,
        lname,
        email,
        password: passwordHash,
      });
      return newUser;
    } catch (e) {
      if (e.name == 'SequelizeUniqueConstraintError') {
        for (const err of e.errors) {
          switch (err.path) {
            case 'email':
              throw new EmailError('Email already in use');
              break;
            default:
              break;
          }
        }
      }
      throw e;
    }
  }

  /**
   * Verifies a user's credentials, then creates a session and returns it.
   * @param {string} email User's email
   * @param {string} password User's password
   * @throws {UserError} When no user exists by provided credentials
   * @throws {PasswordError} When password does not match
   */
  @Mutation((returns) => String)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ): Promise<string> {
    const user = await User.scope('auth').findOne({ where: { email } });
    if (!user) {
      throw new UserError(`User doesn't exist for '${email}'`);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // login and sign a jwt

      // TODO: make configurable
      const tokenLifetime = 300; // in seconds
      const token = await jwt.sign(
        {
          userId: user.id,
          exp: Math.floor(Date.now() / 1000) + tokenLifetime,
        },
        process.env.APP_SECRET ?? '',
      );
      return token;
    } else {
      throw new PasswordError('Invalid password');
    }
  }
}
