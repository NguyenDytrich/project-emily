import { Model } from 'sequelize';
declare class User extends Model {
    id: number;
    fname: string;
    lname: string;
    email: string;
    password: string;
    lastLogin: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
declare function initialize(url: string): Promise<void>;
export { initialize, User };
//# sourceMappingURL=index.d.ts.map