import {
  firstChild$,
  mapGet$,
  mapHas$,
  mapSet$,
  nextSibling$,
  setHas$,
} from './dom';
import { X_CHAR, VOID_ELEMENTS } from './constants';
import { AbstractBlock, Flags } from './types';
import type {
  Edit,
  VNode,
  InitChild,
  InitEvent,
  EditEvent,
  EditStyleAttribute,
  EditSvgAttribute,
  EditAttribute,
  EditChild,
  InitBlock,
} from './types';

export const renderToTemplate = (
  vnode: VNode,
  edits: Edit[] = [],
  path: number[] = [],
): string => {
  if (typeof vnode === 'string') {
    return vnode;
  }
  if (
    typeof vnode === 'number' ||
    typeof vnode === 'bigint' ||
    vnode === true
  ) {
    return String(vnode);
  }
  if (vnode === null || vnode === undefined || vnode === false) {
    return '';
  }

  let props = '';
  let children = '';

  const current: Edit = {
    edits: {},
    inits: null,
    getRoot: (
      root: HTMLElement,
      cache: Map<number, HTMLElement> | null,
      key: number | null,
    ) => {
      if (cache && key !== null && mapHas$.call(cache, path)) {
        return mapGet$.call(cache, path)!;
      }
      const el = getCurrentElement(path, root);
      if (cache && key !== null) mapSet$.call(cache, key, el);
      return el;
    },
  };
  const editsPointer: Edit['edits'] = {};
  let initsPointer = current.inits;

  for (let name in vnode.props) {
    const value = vnode.props[name];
    if (name === 'key' || name === 'ref' || name === 'children') {
      continue;
    }
    if (name === 'className') name = 'class';
    if (name === 'htmlFor') name = 'for';

    if (name.startsWith('on')) {
      const isValueHole = '__key' in value;
      const hole = value.__key;
      // Make edits monomorphic
      if (isValueHole && hole !== undefined && hole !== null) {
        const next: EditEvent = {
          type: Flags.EVENT,
          name,
          value: null,
          hole,
          index: null,
          listener: null,
          patch: null,
          block: null,
          next: null,
        };
        mountNode(current.edits, hole, next);
        editsPointer[hole] = addNode(editsPointer[hole], next);
      } else {
        const next: InitEvent = {
          type: Flags.EVENT,
          name,
          value: null,
          hole: null,
          index: null,
          listener: value,
          patch: null,
          block: null,
          next: null,
        };
        mountNode(current, 'inits', next);
        initsPointer = addNode(initsPointer, next);
      }

      continue;
    }

    if (value) {
      if (typeof value === 'object' && '__key' in value) {
        const hole = value.__key;
        const next: EditAttribute | EditStyleAttribute | EditSvgAttribute = {
          type:
            name === 'style'
              ? Flags.STYLE_ATTRIBUTE
              : name.charCodeAt(0) === X_CHAR
              ? Flags.SVG_ATTRIBUTE
              : Flags.ATTRIBUTE,
          name,
          value: null,
          hole,
          index: null,
          listener: null,
          patch: null,
          block: null,
          next: null,
        };

        mountNode(current.edits, hole, next);
        editsPointer[hole] = addNode(editsPointer[hole], next);
      } else {
        if (name === 'style') {
          let style = '';
          for (const key in value) {
            style += `${key}:${String(value[key])};`;
          }
          props += ` style="${style}"`;
        }
        props += ` ${name}="${String(value)}"`;
      }
    }
  }

  if (setHas$.call(VOID_ELEMENTS, vnode.type)) {
    return `<${vnode.type}${props} />`;
  }

  // 👎: 'foo' + Block + 'bar' => 'foobaz'.
  //                                      ↕️ Block edit here
  // 👍: 'foo' + Block + 'bar'   => 'foo', 'bar'
  let canMergeString = false;
  for (let i = 0, j = vnode.props.children?.length || 0, k = 0; i < j; ++i) {
    const child = vnode.props.children?.[i];
    if (child === null || child === undefined || child === false) continue;

    if (typeof child === 'object' && '__key' in child) {
      const hole = child.__key;
      const next: EditChild = {
        type: Flags.CHILD,
        name: null,
        value: null,
        hole,
        index: i,
        listener: null,
        patch: null,
        block: null,
        next: null,
      };

      mountNode(current.edits, hole, next);
      editsPointer[hole] = addNode(editsPointer[hole], next);
      continue;
    }

    if (child instanceof AbstractBlock) {
      const next: InitBlock = {
        type: Flags.BLOCK,
        name: null,
        value: null,
        hole: null,
        index: i,
        listener: null,
        patch: null,
        block: child,
        next: null,
      };

      mountNode(current, 'inits', next);
      initsPointer = addNode(initsPointer, next);
      continue;
    }

    if (
      typeof child === 'string' ||
      typeof child === 'number' ||
      typeof child === 'bigint'
    ) {
      const value =
        typeof child === 'number' || typeof child === 'bigint'
          ? String(child)
          : child;
      if (canMergeString) {
        const next: InitChild = {
          type: Flags.CHILD,
          name: null,
          value,
          hole: null,
          index: i,
          listener: null,
          patch: null,
          block: null,
          next: null,
        };
        initsPointer = addNode(initsPointer, next);
        continue;
      }
      canMergeString = true;
      children += value;
      k++;
      continue;
    }

    canMergeString = false;
    children += renderToTemplate(child, edits, [...path, k++]);
  }

  if (current.inits || !isObjectEmpty(current.edits)) {
    edits.push(current);
  }

  return `<${vnode.type}${props}>${children}</${vnode.type}>`;
};

const getCurrentElement = (path: number[], root: HTMLElement): HTMLElement => {
  const pathLength = path.length;
  if (!pathLength) return root;
  // path is an array of indices to traverse the DOM tree
  // For example, [0, 1, 2] becomes:
  // root.firstChild.firstChild.nextSibling.firstChild.nextSibling.nextSibling
  // We use path because we don't have the actual DOM nodes until mount()
  for (let i = 0; i < pathLength; ++i) {
    const siblings = path[i]!;
    // https://www.measurethat.net/Benchmarks/Show/15652/0/childnodes-vs-children-vs-firstchildnextsibling-vs-firs
    root = firstChild$.call(root);
    if (!siblings) continue;
    for (let j = 0; j < siblings; ++j) {
      root = nextSibling$.call(root) as HTMLElement;
    }
  }
  return root;
};

const isObjectEmpty = (object: Record<string, unknown>) => {
  // eslint-disable-next-line no-unreachable-loop
  for (const _ in object) return false;
  return true;
};

const mountNode = (root: any, property: string, node: any) => {
  if (!root[property]) root[property] = node;
  return node;
};

const addNode = (pointer: any | null, next: any) => {
  if (pointer) {
    pointer.next = next;
    return next;
  }
  return next;
};
