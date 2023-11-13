// Copyright (c) 2023 Algora PBC.
// https://github.com/algora-io/sdk/blob/5bcda5de293246b959b5e5ea81529ec46d7a8fe3/README.md

import { useEffect, useState } from 'react';
import { algora, type AlgoraOutput } from '@algora/sdk';
import Link from 'next/link';
import { Spotlight } from './spotlight';

const org = 'aidenybai';
const limit = 2;

type RemoteData<T> =
  | { _tag: 'loading' }
  | { _tag: 'failure'; error: Error }
  | { _tag: 'success'; data: T };

type Bounty = AlgoraOutput['bounty']['list']['items'][number];

export function Bounties() {
  const [bounties, setBounties] = useState<RemoteData<Bounty[]>>({
    _tag: 'loading',
  });

  useEffect(() => {
    const ac = new AbortController();

    algora.bounty.list
      .query({ org, limit, status: 'active' }, { signal: ac.signal })
      .then(({ items: data }) => setBounties({ _tag: 'success', data }))
      .catch((error: Error) => setBounties({ _tag: 'failure', error }));

    return () => ac.abort();
  }, []);

  return (
    <div className="space-y-2">
      <Callout />
      <ul className="hidden sm:grid sm:grid-cols-2 gap-2">
        {bounties._tag === 'success' &&
          bounties.data.map((bounty) => (
            <li key={bounty.id}>
              <BountyCard bounty={bounty} />
            </li>
          ))}
        {bounties._tag === 'loading' &&
          Array(limit)
            .fill(0)
            .map((_, i) => (
              <li key={i}>
                <BountyCardSkeleton />
              </li>
            ))}
      </ul>
    </div>
  );
}

function BountyCard(props: { bounty: Bounty }) {
  return (
    <Link
      href={props.bounty.task.url}
      rel="noopener noreferrer"
      className="block group relative h-full rounded-lg border border-zinc-400/50 dark:border-purple-500/50 bg-gradient-to-br from-zinc-300/30 via-zinc-300/40 to-zinc-300/50 dark:from-purple-600/20 dark:via-purple-600/30 dark:to-purple-600/40 md:gap-8 transition-colors hover:border-zinc-400 hover:dark:border-purple-500 hover:bg-zinc-300/10 hover:dark:bg-zinc-600/5 !no-underline"
    >
      <Spotlight className="bg-zinc-300/30 dark:bg-purple-600/20">
        <div className="p-4">
          <div className="text-2xl font-bold text-green-500 group-hover:text-green-600 dark:text-green-400 dark:group-hover:text-green-300 transition-colors">
            {props.bounty.reward_formatted}
          </div>
          <div className="mt-0.5 text-sm text-zinc-700 dark:text-purple-200 group-hover:text-zinc-800 dark:group-hover:text-purple-100 transition-colors">
            {props.bounty.task.repo_name}#{props.bounty.task.number}
          </div>
          <div className="mt-3 line-clamp-1 break-words text-lg font-medium leading-tight text-zinc-800 dark:text-purple-50 group-hover:text-zinc-900 dark:group-hover:text-white">
            {props.bounty.task.title}
          </div>
        </div>
      </Spotlight>
    </Link>
  );
}

function BountyCardSkeleton() {
  return (
    <div className="h-[122px] animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800">
      <div className="relative h-full p-4">
        <div className="mt-1 h-[25px] w-[59px] bg-zinc-300 dark:bg-zinc-700 rounded-md" />
        <div className="mt-2.5 h-[14px] w-[86px] bg-zinc-300 dark:bg-zinc-700 rounded-md" />
        <div className="mt-4 h-[20px] bg-zinc-300 dark:bg-zinc-700 rounded-md" />
      </div>
    </div>
  );
}

function Callout() {
  return (
    <div className="overflow-x-auto mt-6 flex rounded-lg border py-2 ltr:pr-4 rtl:pl-4 contrast-more:border-current contrast-more:dark:border-current border-purple-100 bg-green-100 text-green-800 dark:border-purple-400/30 dark:bg-purple-600/20 dark:text-purple-300">
      <div className="mt-px select-none text-xl ltr:pl-3 ltr:pr-2 rtl:pr-3 rtl:pl-2">
        💸
      </div>
      <div className="w-full min-w-0 leading-7">
        <p className="mt-6 leading-7 first:mt-0">
          We&apos;re actively looking for and <strong>paying</strong>{' '}
          contributors for Million.js. Check out our{' '}
          <Link
            href={`https://console.algora.io/org/${org}/bounties`}
            target="_blank"
            rel="noopener noreferrer"
            className="!underline font-medium"
          >
            active bounties
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
