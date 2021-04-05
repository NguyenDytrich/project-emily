import { User } from '../../models';
export declare class EmailError extends Error {
    constructor(message: string);
}
export declare class PasswordError extends Error {
    constructor(message: string);
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
export declare function signup(fname: string, lname: string, email: string, password: string, passwordConf: string): Promise<User>;
//# sourceMappingURL=auth.d.ts.map