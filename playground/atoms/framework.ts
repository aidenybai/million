import { atom } from 'jotai';
import { z } from 'zod';

export const zFrameworks = z.enum(['react', 'nextjs']);
export type Framework = z.infer<typeof zFrameworks>;

export const frameworkAtom = atom<Framework>('react');
