export interface VNode {
  tag: string;
  text?: string;
  attributes?: Record<string, string>;
  children?: (VNode | string)[];
  el?: HTMLElement;
}

export const h = (
  tag: string,
  text: string,
  attributes: Record<string, string>,
  children: (VNode | string)[],
): VNode => ({
  tag,
  text,
  attributes,
  children,
});
