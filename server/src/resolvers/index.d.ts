interface SignupArgs {
    fname: string;
    lname: string;
    email: string;
    password: string;
    passwordConf: string;
}
interface LoginArgs {
    email: string;
    password: string;
}
export declare const typeDefs: import("graphql").DocumentNode;
export declare const resolvers: {
    Query: {
        test: () => string;
    };
    Mutation: {
        signup: (_: any, args: SignupArgs) => Promise<boolean>;
        login: (_: any, args: LoginArgs) => Promise<string>;
    };
};
export {};
//# sourceMappingURL=index.d.ts.map