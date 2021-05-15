import { ApolloClient, InMemoryCache } from "@apollo/client";

export const Apollo = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});
