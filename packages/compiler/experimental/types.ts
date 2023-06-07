import type {
  ArrowFunctionExpression,
  StringLiteral,
  NumericLiteral,
  Identifier,
} from '@babel/types';

export interface IrEditBase {
  type: NumericLiteral;
  name?: StringLiteral;
  value?: StringLiteral;
  hole?: StringLiteral;
  index?: NumericLiteral;
  listener?: ArrowFunctionExpression | Identifier;
}

export interface IrEditAttribute extends IrEditBase {
  type: NumericLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface IrEditStyleAttribute extends IrEditBase {
  type: NumericLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface IrEditSvgAttribute extends IrEditBase {
  type: NumericLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface IrEditChild extends IrEditBase {
  type: NumericLiteral;
  hole: StringLiteral;
  index: NumericLiteral;
}

export interface IrEditBlock extends IrEditBase {
  type: NumericLiteral;
  index: NumericLiteral;
}

export interface IrEditEvent extends IrEditBase {
  type: NumericLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface IrInitEvent extends IrEditBase {
  type: NumericLiteral;
  name: StringLiteral;
  listener: ArrowFunctionExpression | Identifier;
}

export interface IrInitChild extends IrEditBase {
  type: NumericLiteral;
  value: StringLiteral;
  index: NumericLiteral;
}

export interface IrEdit {
  path: number[];
  edits: (
    | IrEditAttribute
    | IrEditStyleAttribute
    | IrEditSvgAttribute
    | IrEditChild
    | IrEditBlock
    | IrEditEvent
  )[];
  inits: (IrInitEvent | IrInitChild)[];
}

export interface IrTreeNode {
  children: IrTreeNode[];
  path?: number[];
}

export interface IrPrunedNode {
  index: number;
  parent?: IrPrunedNode;
  path?: number[];
  child?: IrPrunedNode;
  next?: IrPrunedNode;
  prev?: IrPrunedNode;
}
