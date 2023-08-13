/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import axios from 'axios';
import { block } from 'million/react';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const queryClient = new QueryClient();

function TanstackQuery() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}

const Example = block(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { isLoading, error, data, isFetching } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      axios
        .get('https://api.github.com/repos/tannerlinsley/react-query')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        .then((res) => res.data),
  });

  if (isLoading) return 'Loading...';

  if (error) return `An error has occurred: ${(error as Error).message}`;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{' '}
      <strong>✨ {data.stargazers_count}</strong>{' '}
      <strong>🍴 {data.forks_count}</strong>
      <div>{isFetching ? 'Updating...' : ''}</div>
    </div>
  );
});

// eslint-disable-next-line import/no-default-export
export default TanstackQuery;
