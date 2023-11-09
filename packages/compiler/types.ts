export interface Options {
  optimize?: boolean;
  server?: boolean;
  mode?: 'react' | 'preact' | 'react-server' | 'preact-server' | 'vdom';
  mute?: boolean | 'info';
  hmr?: boolean;
  auto?:
    | boolean
    | { threshold?: number; rsc?: boolean; skip?: (string | RegExp)[] };
  _file?: string;
}
