import { GraphQLScalarType, Kind } from 'graphql';
import Delta from 'quill-delta';

export const DeltaScalar = new GraphQLScalarType({
  name: 'Delta',
  description: 'A Quill Delta object',
  serialize(value: unknown): string {
    if (!(value instanceof Delta)) {
      throw new Error('DeltaScalar can only serialize Delta values');
    }
    return JSON.stringify(value);
  },
  parseValue(value: unknown): Delta {
    if (typeof value !== 'string') {
      throw new Error('DeltaScalar can only parse string values');
    }
    return new Delta(JSON.parse(value));
  },
  parseLiteral(ast): Delta {
    if (ast.kind !== Kind.STRING) {
      throw new Error('DeltaScalar can only parse string values');
    }
    // TODO validate the json
    return new Delta(JSON.parse(ast.value));
  },
});
