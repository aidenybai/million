import type { Options } from './plugin';

// TODO: refactor `any` type
interface Visitor {
  CallExpression: any | null;
  JSXElement: any | null;
  FunctionDeclaration: any | null;
  VariableDeclaration: any | null;
}

const pool: Record<string, Visitor | null> = {
  vdom: null,
  react: null,
  preact: null,
};

const vdom = async (options: Options) => {
  if (pool.vdom) return pool.vdom;

  const { visitor: callExpressionVisitor } = await import('./vdom');
  const visitor = {
    CallExpression: callExpressionVisitor(options),
    JSXElement: null,
    FunctionDeclaration: null,
    VariableDeclaration: null,
  };
  pool.vdom = visitor;
  return visitor;
};

const react = async (options: Options, isReact = true) => {
  const mode = isReact ? 'react' : 'preact';
  if (pool[mode]) return pool[mode] as Visitor;

  const { callExpressionVisitor, jsxElementVisitor, componentVisitor } =
    await import('./react');

  const visitor = {
    CallExpression: callExpressionVisitor(options, isReact),
    JSXElement: jsxElementVisitor(options, isReact),
    FunctionDeclaration: componentVisitor(options, isReact),
    VariableDeclaration: componentVisitor(options, isReact),
  };
  pool[mode] = visitor;
  return visitor;
};

const preact = (options: Options) => {
  return react(options, false);
};

export const init = (
  visitor: ReturnType<typeof visitors>,
  options: Options,
  ...params: any[]
) => {
  const result = {};

  for (const key in visitor) {
    const visit = visitor[key];
    try {
      result[key] = visit(...params);
    } catch (err: unknown) {
      if (err instanceof Error && err.message && !options.mute) {
        // eslint-disable-next-line no-console
        console.warn(err.message, '\n');
      }
    }
  }
  return result;
};

export const visitors = {
  vdom,
  react,
  preact,
};
