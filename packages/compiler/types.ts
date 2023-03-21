import type {
  ArrowFunctionExpression,
  StringLiteral,
  NumericLiteral,
  Identifier,
} from '@babel/types';

export interface AstEditBase {
  type: StringLiteral;
  name?: StringLiteral;
  value?: StringLiteral;
  hole?: StringLiteral;
  index?: NumericLiteral;
  listener?: ArrowFunctionExpression | Identifier;
}

export interface AstEditAttribute extends AstEditBase {
  type: StringLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface AstEditStyleAttribute extends AstEditBase {
  type: StringLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface AstEditSvgAttribute extends AstEditBase {
  type: StringLiteral;
  hole: StringLiteral;
  name: StringLiteral;
}

export interface AstEditChild extends AstEditBase {
  type: StringLiteral;
  hole: StringLiteral;
  index: NumericLiteral;
}

export interface AstEditBlock extends AstEditBase {
  type: StringLiteral;
  index: NumericLiteral;
}

export interface AstEditEvent extends AstEditBase {
  type: StringLiteral;
  hole?: StringLiteral;
  name: StringLiteral;
  listener?: ArrowFunctionExpression | Identifier;
}

export interface AstEdit {
  path: number[];
  edits: (
    | AstEditAttribute
    | AstEditStyleAttribute
    | AstEditSvgAttribute
    | AstEditChild
    | AstEditBlock
    | AstEditEvent
  )[];
  inits: [];
}
