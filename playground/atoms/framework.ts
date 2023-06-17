import { atom } from 'jotai';
import type { Framework } from '@/types';

export const frameworkAtom = atom<Framework>('react');
