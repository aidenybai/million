import { atom } from 'jotai';
import { z } from 'zod';
import { files as reactViteFiles } from '@/configurations/react-vite';
import { files as nextjsFiles } from '@/configurations/nextjs';
import type {
  SandpackFiles,
  SandpackPredefinedTemplate,
} from '@codesandbox/sandpack-react';

export const zFrameworks = z.enum(['react', 'nextjs']);
export type Framework = z.infer<typeof zFrameworks>;

export const frameworkAtom = atom<Framework>('react');

const zSandpackFile = z.object({
  code: z.string(),
  hidden: z.boolean().optional(),
  active: z.boolean().optional(),
  readOnly: z.boolean().optional(),
});

const zSandpackFiles = z.record(z.union([z.string(), zSandpackFile]));

const zPlaygroundState = z.object({
  options: z.object({
    framework: zFrameworks,
  }),
  files: zSandpackFiles,
});

type PlaygroundState = z.infer<typeof zPlaygroundState>;

const FRAMEWORK_TEMPLATE_MAP: Record<Framework, SandpackPredefinedTemplate> = {
  nextjs: 'nextjs',
  react: 'vite-react',
};

const FRAMEWORK_FILES_MAP: Record<Framework, SandpackFiles> = {
  react: reactViteFiles,
  nextjs: nextjsFiles,
};

export const templateAtom = atom<SandpackPredefinedTemplate>((get) => {
  const framework = get(frameworkAtom);
  return FRAMEWORK_TEMPLATE_MAP[framework];
});

export const filesAtom = atom<SandpackFiles>(FRAMEWORK_FILES_MAP.react);

export const rwFilesAtom = atom(
  (get) => {
    const framework = get(frameworkAtom);
    return FRAMEWORK_FILES_MAP[framework];
  },
  (get, set, newValue: SandpackFiles) => {
    // const files = FRAMEWORK_FILES_MAP[get(frameworkAtom)];
    set(filesAtom, newValue);
  },
);

export const playgroundStateAtom = atom(
  (get) => {
    const framework = get(frameworkAtom);
    const files = get(rwFilesAtom);
    return {
      options: {
        framework,
      },
      files,
    };
  },
  (_get, set, newValue: PlaygroundState) => {
    set(frameworkAtom, newValue.options.framework);
    set(rwFilesAtom, newValue.files);
  },
);

type Action = { type: 'save'; value: PlaygroundState } | { type: 'load' };

const LOCAL_STORAGE_KEY = 'playgroundState';

export const serializeAtom = atom(null, (_get, set, action: Action) => {
  switch (action.type) {
    case 'save': {
      set(playgroundStateAtom, action.value);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(action.value));
      break;
    }
    case 'load': {
      const item = localStorage.getItem(LOCAL_STORAGE_KEY);
      const result = zPlaygroundState.safeParse(JSON.parse(item ?? '{}'));
      if (result.success) {
        set(playgroundStateAtom, {
          options: {
            framework: result.data.options.framework,
          },
          files: result.data.files,
        });
      }
      break;
    }
  }
});
