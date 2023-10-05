import * as react from 'react';
import { FunctionComponent, ComponentProps } from 'react';

declare const block: (
  Component: FunctionComponent,
) => (
  props: ComponentProps<any>,
) =>
  | react.DOMElement<react.DOMAttributes<Element>, Element>
  | react.CElement<any, react.Component<any, any, any>>;
declare function For(props: {
  each: any[];
  children: (item: any, index: number) => any;
}):
  | react.FunctionComponentElement<{
      each: any[];
      children: (item: any, index: number) => any;
    }>
  | react.DOMElement<react.DOMAttributes<Element>, Element>;

export { For, block };
