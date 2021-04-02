import { User } from '../../models';
import bcrypt from 'bcrypt';

class EmailError extends Error {
  constructor(message) {
    super(message);
  }
}

class PasswordError extends Error {
  constructor(message) {
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
): User {
  if (password !== passwordConf) {
    throw new PasswordError("Passwords don't match");
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
