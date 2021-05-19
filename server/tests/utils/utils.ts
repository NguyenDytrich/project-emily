import AppContext from '../../src/AppContext';
import { JwtPayload } from '../../src/AppContext';
import { ResolverData } from 'type-graphql';
import mockito from 'ts-mockito';

interface MockResolverArgs {
  auth?: string;
  payload?: JwtPayload;
}

function createMockResolverData(
  args?: MockResolverArgs,
): ResolverData<AppContext> {
  const _mResolverData = mockito.mock<ResolverData<AppContext>>();
  mockito.when(_mResolverData.context).thenReturn({
    req: {
      headers: {
        authorization: args?.auth ?? '',
      },
    },
    res: {},
    payload: args?.payload ?? {},
  } as AppContext);
  return mockito.instance(_mResolverData) as ResolverData<AppContext>;
}

export { createMockResolverData };
