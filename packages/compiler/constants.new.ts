import type { ImportDefinition } from "./types";

export const RENDER_SCOPE = 'slot';
export const SKIP_ANNOTATION = '@million skip';
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

interface Imports {
  block: {
    client: ImportDefinition;
    server: ImportDefinition;
  };
  For: {
    client: ImportDefinition;
    server: ImportDefinition;
  };
}

export const IMPORTS: Imports = {
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

interface HiddenImports {
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
