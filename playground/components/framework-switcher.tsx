import { useSandpack } from '@codesandbox/sandpack-react';
import { useSetAtom } from 'jotai';
import { frameworkAtom } from './editor';
import type { Frameworks as Framework } from '@/types';

type FrameworkConfig = {
  value: Framework;
  label: string;
};

const frameworks: FrameworkConfig[] = [
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
];

export function FrameworkSwitcher() {
  const { dispatch } = useSandpack();
  const setFramework = useSetAtom(frameworkAtom);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFramework = event.target.value as Framework;
    setFramework(selectedFramework);

    setTimeout(() => {
      dispatch({ type: 'shell/restart' });
    }, 1000);
  };

  return (
    <div className="flex flex-row items-center justify-center space-x-5">
      <h1 className="text-black">FRAMEWORK: </h1>
      <select
        onChange={handleSelect}
        className=" bg-white border border-gray-500 text-gray-700 h-10 pl-5 pr-10 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
      >
        {frameworks.map((framework) => (
          <option
            key={framework.value}
            value={framework.value}
            className="py-1"
          >
            {framework.label}
          </option>
        ))}
      </select>
    </div>
  );
}
