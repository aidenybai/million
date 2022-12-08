/* eslint-disable @typescript-eslint/unbound-method */

export const nodeProto = Node.prototype;
export const insertBefore = nodeProto.insertBefore;
export const cloneNode = nodeProto.cloneNode;

export const setAttribute = (
  el: HTMLElement,
  name: string,
  value?: string | null | EventListener,
) => {
  if (name.startsWith('on')) {
    const event = name.slice(2).toLowerCase() as keyof HTMLElementEventMap;
    el.addEventListener(event, value as EventListener);
  } else if (value !== undefined && value !== null) {
    if (
      el[name] !== undefined &&
      el[name] !== null &&
      !Reflect.has(el.style, name) &&
      !(el instanceof SVGElement) &&
      name in el
    ) {
      el[name] = value;
    } else {
      el.setAttribute(name, String(value));
    }
  }
};
