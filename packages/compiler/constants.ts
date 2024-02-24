import type { ImportDefinition } from './types';

export const RENDER_SCOPE = 'slot';
export const SKIP_ANNOTATION = '@million skip';
export const IGNORE_ANNOTATION = 'million-ignore';
export const JSX_SKIP_ANNOTATION = '@million jsx-skip';
export const SVG_ELEMENTS = [
  'circle',
  'ellipse',
  'foreignObject',
  'image',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',
  'text',
  'textPath',
  'tspan',
  'svg',
  'g',
];
export const NO_PX_PROPERTIES = [
  'animationIterationCount',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'fillOpacity',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'stopOpacity',
  'strokeDashoffset',
  'strokeOpacity',
  'strokeWidth',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  // SVG-related properties
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
];

export interface TrackedImports {
  block: {
    client: ImportDefinition;
    server: ImportDefinition;
  };
  For: {
    client: ImportDefinition;
    server: ImportDefinition;
  };
}

export const INVERSE_IMPORTS = {
  client: {
    source: 'million/react-server',
    target: 'million/react',
  },
  server: {
    source: 'million/react',
    target: 'million/react-server',
  },
};

export const TRACKED_IMPORTS: TrackedImports = {
  block: {
    client: {
      kind: 'named',
      name: 'block',
      source: 'million/react',
    },
    server: {
      kind: 'named',
      name: 'block',
      source: 'million/react-server',
    },
  },
  For: {
    client: {
      kind: 'named',
      name: 'For',
      source: 'million/react',
    },
    server: {
      kind: 'named',
      name: 'For',
      source: 'million/react-server',
    },
  },
};

export interface HiddenImports {
  compiledBlock: {
    client: ImportDefinition;
    server: ImportDefinition;
  };
}

export const HIDDEN_IMPORTS: HiddenImports = {
  compiledBlock: {
    client: {
      kind: 'named',
      name: 'compiledBlock',
      source: 'million/react',
    },
    server: {
      kind: 'named',
      name: 'compiledBlock',
      source: 'million/react-server',
    },
  },
};

interface ReactImports {
  memo: {
    client: ImportDefinition;
    server: ImportDefinition;
  };
}

export const REACT_IMPORTS: ReactImports = {
  memo: {
    client: {
      kind: 'named',
      name: 'memo',
      source: 'react',
    },
    server: {
      kind: 'named',
      name: 'memo',
      source: 'react',
    },
  },
};
