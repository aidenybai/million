import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAtom } from 'jotai';
import { frameworkAtom, zFrameworks, type Framework } from '@/atoms';

export const useFrameworkSyncUrl = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [framework, setFramework] = useAtom(frameworkAtom);

  // keep url in sync with atom
  useEffect(() => {
    router.replace(
      `/${framework === 'react' ? '' : `?framework=${framework}`}`,
    );
  }, [framework]);

  //parse url
  const rawFrameworkParam = params.get('framework');
  const parseResult = zFrameworks.safeParse(rawFrameworkParam);
  let finalFrameworkParam: Framework = 'react';
  if (!parseResult.success) {
    router.push(`/`);
  } else {
    finalFrameworkParam = parseResult.data;
  }

  // keep atom in sync with url
  useEffect(() => {
    if (framework !== finalFrameworkParam) {
      setFramework(finalFrameworkParam);
    }
  }, [finalFrameworkParam]);

  return [framework, setFramework] as const;
};

// export const useFrameworkSyncSandpack = () => {
//   const { dispatch, sandpack } = useSandpack();
//   const framework = useAtomValue(frameworkAtom);
//   console.log('status', sandpack.clients['41e6']);
//   useEffect(() => {
//     setTimeout(() => {
//       dispatch({ type: 'shell/restart' });
//     }, 1000);
//   }, [framework]);
// };
