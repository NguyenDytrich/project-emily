import { User } from '../../models';
import bcrypt from 'bcrypt';

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

/**
 * Creates a user instance with a hashed password.
 * @param {string} fname User's first name
 * @param {string} lname User's last name
 * @param {string} email User's email
 * @param {string} password User's password
 * @param {string} passwordConf User's password confirmation
 * @returns {User} The newly craeted user reference
 * @throws {PasswordError} When the password does not match the confirmation
 * @throws {EmailError} When the email is not valid
 */
export async function signup(
  fname: string,
  lname: string,
  email: string,
  password: string,
  passwordConf: string,
): Promise<User> {
  if (password !== passwordConf) {
    throw new PasswordError("Passwords don't match");
  }

  const RFC2822_EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  if (!email.match(RFC2822_EMAIL_REGEX)) {
    throw new EmailError('Invalid email address');
  }

  const passwordHash = await bcrypt.hash(
    password,
    process.env.BCRYPT_SALT_ROUNDS ?? 10,
  );

  const user = await User.create({
    fname,
    lname,
    email,
    passwordHash,
  });

  return user;
}