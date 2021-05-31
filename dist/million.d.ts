declare const _: undefined;
type Props = Record<string, string | Record<string, string | boolean>>;
type VNodeChildren = (VNode | string)[];
interface VNode {
    tag: string;
    props?: Props;
    children?: VNodeChildren;
}
declare const h: (tag: string, props: Props, children: VNodeChildren) => VNode;
declare const patch: (newVNode: VNode | string | undefined, el: HTMLElement, prevVNode: VNode | string | undefined) => void;
declare const element: (vnode: VNode | string) => HTMLElement | Text;
export { _, h, patch, element };
