import type {
  ArrowFunctionExpression,
  StringLiteral,
  NumericLiteral,
} from '@babel/types';

export interface AstEditBase {
  type: StringLiteral;
  name?: StringLiteral;
  value?: StringLiteral;
  hole?: StringLiteral;
  index?: NumericLiteral;
  listener?: ArrowFunctionExpression;
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
  listener?: ArrowFunctionExpression;
}

export interface AstEdit {
  path: NumericLiteral[];
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
