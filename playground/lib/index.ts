import { z } from 'zod';
import { zFrameworks } from '@/atoms';

// from code sandbox I couldnt figure out the import its in a weird dist folder
// import { type SandpackBundlerFile } from '@codesandbox/sandpack-react/dist/types';
// interface SandpackBundlerFile {
//   code: string;
//   hidden?: boolean;
//   active?: boolean;
//   readOnly?: boolean;
// }

const zSandpackBundlerFile = z.object({
  code: z.string(),
  hidden: z.boolean().optional(),
  active: z.boolean().optional(),
  readOnly: z.boolean().optional(),
});

export const zPlaygroundState = z.object({
  options: z.object({
    framework: zFrameworks,
  }),
  files: z.record(zSandpackBundlerFile),
});

export type PlaygroundState = z.infer<typeof zPlaygroundState>;
