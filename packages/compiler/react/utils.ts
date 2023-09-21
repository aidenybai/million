import * as t from '@babel/types';
import { type NodePath } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import { bgMagenta, cyan, magenta, dim } from 'kleur/colors';
import { collectImportedBindings } from './bindings';
import type { Options } from '../plugin';

export const RENDER_SCOPE = 'slot';
export const TRANSFORM_ANNOTATION = 'million:transform';

export const getUniqueId = () => Math.random().toString(36).substring(2, 16);

export const getValidSpecifiers = (
  importDeclarationPath: NodePath<t.ImportDeclaration>,
  aliases: Record<string, string>,
  file: string,
): string[] => {
  const importDeclaration = importDeclarationPath.node;
  /**
   * Here we just check if the import declaration is using the correct package
   * in case another library exports a function called "block".
   */
  const validSpecifiers: string[] = [];

  if (
    !t.isImportDeclaration(importDeclaration) ||
    !importDeclaration.source.value.includes('million') ||
    !importDeclaration.specifiers.every((specifier) => {
      if (!t.isImportSpecifier(specifier)) return false;
      const importedSpecifier = specifier.imported;
      if (!t.isIdentifier(importedSpecifier)) return false;

      const checkValid = (validName: string) => {
        return (
          importedSpecifier.name === validName && aliases[specifier.local.name]
        );
      };

      const isSpecifierValid =
        checkValid('block') ||
        checkValid('For') ||
        checkValid('macro') ||
        checkValid('renderReactScope') ||
        checkValid('renderPreactScope');

      if (isSpecifierValid) {
        validSpecifiers.push(importedSpecifier.name);
      }

      return isSpecifierValid;
    })
  ) {
    throw createDeopt(
      'Found unsupported import for block. Make sure blocks are imported from correctly.',
      file,
      importDeclarationPath,
    );
  }

  return validSpecifiers;
};

export const isSensitiveElement = (jsx: t.JSXElement) => {
  // elements that break when the children are not in a specific format
  const sensitiveElements = ['select'];

  return (
    t.isJSXIdentifier(jsx.openingElement.name) &&
    sensitiveElements.includes(jsx.openingElement.name.name)
  );
};

export const hasStyledAttributes = (attribute: t.JSXAttribute) => {
  return attribute.name.name === 'tw' || attribute.name.name === 'css';
};

export const resolveCorrectImportSource = (
  options: Options,
  source: string,
) => {
  if (!source.startsWith('million')) return source;
  const mode = options.mode || 'react';
  if (options.server) {
    return `million/${mode}-server`;
  }
  return `million/${mode}`;
};

export const createError = (message: string, path: NodePath, file: string) => {
  return path.buildCodeFrameError(
    `\n${styleSecondaryMessage(message, '⚠')} ${styleCommentMessage(
      String(file),
    )}`,
  );
};

export const stylePrimaryMessage = (message: string, comment: string) => {
  return `\n🦁 ${bgMagenta(' million ')} ${magenta(message)} \n${comment}\n`;
};

export const styleSecondaryMessage = (message: string, emoticon: string) => {
  return `${magenta(emoticon)} ${message}`;
};

export const styleLinks = (message: string) => {
  const parsedMessage = message.replaceAll(/https?:\/\/[^\s]+/g, (match) => {
    return cyan(match);
  });
  return parsedMessage;
};

export const styleCommentMessage = (message: string) => {
  return dim(styleLinks(message));
};

export const warn = (
  message: string,
  file: string,
  path: NodePath,
  mute?: boolean | string | null,
) => {
  if (mute) return;
  const err = createError(message, path, file);
  // eslint-disable-next-line no-console
  console.warn(
    err.message,
    '\n',
    styleCommentMessage(
      `Check out the Rules of Blocks: https://million.dev/docs/rules. Enable the "mute" option to disable this message.`,
    ),
    '\n',
  );
};

export const createDeopt = (
  message: string | null,
  file: string,
  callSitePath: NodePath,
  path?: NodePath | null,
) => {
  const { parent, node } = callSitePath;
  if (
    t.isVariableDeclarator(parent) &&
    'arguments' in node &&
    t.isIdentifier(node.arguments[0])
  ) {
    parent.init = node.arguments[0];
  }
  if (message === null) return new Error('');
  return createError(message, path ?? callSitePath, file);
};

export const isStatic = (node: t.Node) => {
  if (
    t.isTaggedTemplateExpression(node) &&
    t.isIdentifier(node.tag) &&
    node.quasi.expressions.length === 0 &&
    node.tag.name === 'css'
  ) {
    return true;
  }
  return t.isLiteral(node) && !t.isTemplateLiteral(node);
};

export const resolvePath = (path: NodePath | NodePath[]): NodePath => {
  return Array.isArray(path) ? path[0]! : path;
};

export const isComponent = (name: string) => {
  return (
    name.startsWith(name[0]!.toUpperCase()) &&
    !name.startsWith('_') &&
    !name.startsWith('use')
  );
};

export const handleVisitorError = (
  ctx: () => void,
  mute: boolean | string | undefined | null,
) => {
  try {
    ctx();
  } catch (err: unknown) {
    if (err instanceof Error && err.message && !mute) {
      // eslint-disable-next-line no-console
      console.warn(err.message, '\n');
    }
  }
};

export const removeDuplicateJSXAttributes = (
  attributes: (t.JSXAttribute | t.JSXSpreadAttribute)[],
) => {
  const seen = new Set<string>();
  for (let i = attributes.length - 1; i >= 0; i--) {
    const attr = attributes[i]!;
    if (
      t.isJSXAttribute(attr) &&
      t.isJSXIdentifier(attr.name) &&
      seen.has(attr.name.name)
    ) {
      attributes.splice(i, 1);
    }

    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
      seen.add(attr.name.name);
    }
  }
  return attributes;
};

export const trimJsxChildren = (jsx: t.JSXElement | t.JSXFragment) => {
  for (let i = jsx.children.length - 1; i >= 0; i--) {
    const child = jsx.children[i]!;
    const isEmptyText = t.isJSXText(child) && child.value.trim() === '';
    const isEmptyExpression =
      t.isJSXExpressionContainer(child) &&
      t.isJSXEmptyExpression(child.expression);

    if (isEmptyText || isEmptyExpression) {
      jsx.children.splice(i, 1);
    }
  }
};

export const normalizeProperties = (properties: t.ObjectProperty[]) => {
  const seen = new Set<string>();
  for (let i = properties.length - 1; i >= 0; i--) {
    if (!properties[i]) {
      properties.splice(i, 1);
      continue;
    }
    const prop = properties[i]!;
    if (
      t.isObjectProperty(prop) &&
      t.isIdentifier(prop.key) &&
      seen.has(prop.key.name)
    ) {
      properties.splice(i, 1);
    }
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      seen.add(prop.key.name);
    }
  }
  return properties;
};

export const isJSXFragment = (
  node: t.Node | null | undefined,
): node is t.JSXFragment | t.JSXElement => {
  if (t.isJSXElement(node)) {
    const type = node.openingElement.name;
    if (t.isJSXMemberExpression(type) && type.property.name === 'Fragment')
      return true;
    if (t.isJSXIdentifier(type) && type.name === 'Fragment') return true;
  }

  return t.isJSXFragment(node);
};

export const addNamedCache = (
  name: string,
  source: string,
  path: NodePath,
  programPath: NodePath<t.Program>,
) => {
  const { bindings } = collectImportedBindings(programPath);
  if (bindings[name]) {
    return t.identifier(bindings[name]!);
  }

  const id = addNamed(path, name, source, {
    nameHint: `${name}$`,
  });

  return id;
};

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
