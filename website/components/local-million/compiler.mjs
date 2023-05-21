import { createUnplugin } from 'unplugin';
import { transformAsync } from '@babel/core';
import require$$0 from 'assert';
import * as t from '@babel/types';
import t__default from '@babel/types';
import { d as EventFlag, e as StyleAttributeFlag, f as X_CHAR, g as SvgAttributeFlag, A as AttributeFlag, C as ChildFlag } from './chunks/constants.mjs';

var lib$1 = {};

Object.defineProperty(lib$1, "__esModule", {
  value: true
});
var declare_1 = lib$1.declare = declare;
lib$1.declarePreset = void 0;
const apiPolyfills = {
  assertVersion: api => range => {
    throwVersionError(range, api.version);
  },
  targets: () => () => {
    return {};
  },
  assumption: () => () => {
    return undefined;
  }
};
function declare(builder) {
  return (api, options, dirname) => {
    var _clonedApi2;
    let clonedApi;
    for (const name of Object.keys(apiPolyfills)) {
      var _clonedApi;
      if (api[name]) continue;

      clonedApi = (_clonedApi = clonedApi) != null ? _clonedApi : copyApiObject(api);
      clonedApi[name] = apiPolyfills[name](clonedApi);
    }

    return builder((_clonedApi2 = clonedApi) != null ? _clonedApi2 : api, options || {}, dirname);
  };
}
const declarePreset = declare;
lib$1.declarePreset = declarePreset;
function copyApiObject(api) {
  let proto = null;
  if (typeof api.version === "string" && /^7\./.test(api.version)) {
    proto = Object.getPrototypeOf(api);
    if (proto && (!has(proto, "version") || !has(proto, "transform") || !has(proto, "template") || !has(proto, "types"))) {
      proto = null;
    }
  }
  return Object.assign({}, proto, api);
}
function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function throwVersionError(range, version) {
  if (typeof range === "number") {
    if (!Number.isInteger(range)) {
      throw new Error("Expected string or integer value.");
    }
    range = `^${range}.0.0-0`;
  }
  if (typeof range !== "string") {
    throw new Error("Expected string or integer value.");
  }
  const limit = Error.stackTraceLimit;
  if (typeof limit === "number" && limit < 25) {
    Error.stackTraceLimit = 25;
  }
  let err;
  if (version.slice(0, 2) === "7.") {
    err = new Error(`Requires Babel "^7.0.0-beta.41", but was loaded with "${version}". ` + `You'll need to update your @babel/core version.`);
  } else {
    err = new Error(`Requires Babel "${range}", but was loaded with "${version}". ` + `If you are sure you have a compatible version of @babel/core, ` + `it is likely that something in your build process is loading the ` + `wrong version. Inspect the stack trace of this error to look for ` + `the first entry that doesn't mention "@babel/core" or "babel-core" ` + `to see what is calling Babel.`);
  }
  if (typeof limit === "number") {
    Error.stackTraceLimit = limit;
  }
  throw Object.assign(err, {
    code: "BABEL_VERSION_UNSUPPORTED",
    version,
    range
  });
}

var lib = {};

var importInjector = {};

var importBuilder = {};

Object.defineProperty(importBuilder, "__esModule", {
  value: true
});
importBuilder.default = void 0;

var _assert$1 = require$$0;

var _t$1 = t__default;

const {
  callExpression,
  cloneNode,
  expressionStatement,
  identifier,
  importDeclaration,
  importDefaultSpecifier,
  importNamespaceSpecifier,
  importSpecifier,
  memberExpression,
  stringLiteral,
  variableDeclaration,
  variableDeclarator
} = _t$1;

class ImportBuilder {
  constructor(importedSource, scope, hub) {
    this._statements = [];
    this._resultName = null;
    this._importedSource = void 0;
    this._scope = scope;
    this._hub = hub;
    this._importedSource = importedSource;
  }

  done() {
    return {
      statements: this._statements,
      resultName: this._resultName
    };
  }

  import() {
    this._statements.push(importDeclaration([], stringLiteral(this._importedSource)));

    return this;
  }

  require() {
    this._statements.push(expressionStatement(callExpression(identifier("require"), [stringLiteral(this._importedSource)])));

    return this;
  }

  namespace(name = "namespace") {
    const local = this._scope.generateUidIdentifier(name);

    const statement = this._statements[this._statements.length - 1];

    _assert$1(statement.type === "ImportDeclaration");

    _assert$1(statement.specifiers.length === 0);

    statement.specifiers = [importNamespaceSpecifier(local)];
    this._resultName = cloneNode(local);
    return this;
  }

  default(name) {
    const id = this._scope.generateUidIdentifier(name);

    const statement = this._statements[this._statements.length - 1];

    _assert$1(statement.type === "ImportDeclaration");

    _assert$1(statement.specifiers.length === 0);

    statement.specifiers = [importDefaultSpecifier(id)];
    this._resultName = cloneNode(id);
    return this;
  }

  named(name, importName) {
    if (importName === "default") return this.default(name);

    const id = this._scope.generateUidIdentifier(name);

    const statement = this._statements[this._statements.length - 1];

    _assert$1(statement.type === "ImportDeclaration");

    _assert$1(statement.specifiers.length === 0);

    statement.specifiers = [importSpecifier(id, identifier(importName))];
    this._resultName = cloneNode(id);
    return this;
  }

  var(name) {
    const id = this._scope.generateUidIdentifier(name);

    let statement = this._statements[this._statements.length - 1];

    if (statement.type !== "ExpressionStatement") {
      _assert$1(this._resultName);

      statement = expressionStatement(this._resultName);

      this._statements.push(statement);
    }

    this._statements[this._statements.length - 1] = variableDeclaration("var", [variableDeclarator(id, statement.expression)]);
    this._resultName = cloneNode(id);
    return this;
  }

  defaultInterop() {
    return this._interop(this._hub.addHelper("interopRequireDefault"));
  }

  wildcardInterop() {
    return this._interop(this._hub.addHelper("interopRequireWildcard"));
  }

  _interop(callee) {
    const statement = this._statements[this._statements.length - 1];

    if (statement.type === "ExpressionStatement") {
      statement.expression = callExpression(callee, [statement.expression]);
    } else if (statement.type === "VariableDeclaration") {
      _assert$1(statement.declarations.length === 1);

      statement.declarations[0].init = callExpression(callee, [statement.declarations[0].init]);
    } else {
      _assert$1.fail("Unexpected type.");
    }

    return this;
  }

  prop(name) {
    const statement = this._statements[this._statements.length - 1];

    if (statement.type === "ExpressionStatement") {
      statement.expression = memberExpression(statement.expression, identifier(name));
    } else if (statement.type === "VariableDeclaration") {
      _assert$1(statement.declarations.length === 1);

      statement.declarations[0].init = memberExpression(statement.declarations[0].init, identifier(name));
    } else {
      _assert$1.fail("Unexpected type:" + statement.type);
    }

    return this;
  }

  read(name) {
    this._resultName = memberExpression(this._resultName, identifier(name));
  }

}

importBuilder.default = ImportBuilder;

var isModule$1 = {};

Object.defineProperty(isModule$1, "__esModule", {
  value: true
});
isModule$1.default = isModule;

function isModule(path) {
  const {
    sourceType
  } = path.node;

  if (sourceType !== "module" && sourceType !== "script") {
    throw path.buildCodeFrameError(`Unknown sourceType "${sourceType}", cannot transform.`);
  }

  return path.node.sourceType === "module";
}

Object.defineProperty(importInjector, "__esModule", {
  value: true
});
importInjector.default = void 0;

var _assert = require$$0;

var _t = t__default;

var _importBuilder = importBuilder;

var _isModule = isModule$1;

const {
  numericLiteral,
  sequenceExpression
} = _t;

class ImportInjector {
  constructor(path, importedSource, opts) {
    this._defaultOpts = {
      importedSource: null,
      importedType: "commonjs",
      importedInterop: "babel",
      importingInterop: "babel",
      ensureLiveReference: false,
      ensureNoContext: false,
      importPosition: "before"
    };
    const programPath = path.find(p => p.isProgram());
    this._programPath = programPath;
    this._programScope = programPath.scope;
    this._hub = programPath.hub;
    this._defaultOpts = this._applyDefaults(importedSource, opts, true);
  }

  addDefault(importedSourceIn, opts) {
    return this.addNamed("default", importedSourceIn, opts);
  }

  addNamed(importName, importedSourceIn, opts) {
    _assert(typeof importName === "string");

    return this._generateImport(this._applyDefaults(importedSourceIn, opts), importName);
  }

  addNamespace(importedSourceIn, opts) {
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), null);
  }

  addSideEffect(importedSourceIn, opts) {
    return this._generateImport(this._applyDefaults(importedSourceIn, opts), void 0);
  }

  _applyDefaults(importedSource, opts, isInit = false) {
    let newOpts;

    if (typeof importedSource === "string") {
      newOpts = Object.assign({}, this._defaultOpts, {
        importedSource
      }, opts);
    } else {
      _assert(!opts, "Unexpected secondary arguments.");

      newOpts = Object.assign({}, this._defaultOpts, importedSource);
    }

    if (!isInit && opts) {
      if (opts.nameHint !== undefined) newOpts.nameHint = opts.nameHint;
      if (opts.blockHoist !== undefined) newOpts.blockHoist = opts.blockHoist;
    }

    return newOpts;
  }

  _generateImport(opts, importName) {
    const isDefault = importName === "default";
    const isNamed = !!importName && !isDefault;
    const isNamespace = importName === null;
    const {
      importedSource,
      importedType,
      importedInterop,
      importingInterop,
      ensureLiveReference,
      ensureNoContext,
      nameHint,
      importPosition,
      blockHoist
    } = opts;
    let name = nameHint || importName;
    const isMod = (0, _isModule.default)(this._programPath);
    const isModuleForNode = isMod && importingInterop === "node";
    const isModuleForBabel = isMod && importingInterop === "babel";

    if (importPosition === "after" && !isMod) {
      throw new Error(`"importPosition": "after" is only supported in modules`);
    }

    const builder = new _importBuilder.default(importedSource, this._programScope, this._hub);

    if (importedType === "es6") {
      if (!isModuleForNode && !isModuleForBabel) {
        throw new Error("Cannot import an ES6 module from CommonJS");
      }

      builder.import();

      if (isNamespace) {
        builder.namespace(nameHint || importedSource);
      } else if (isDefault || isNamed) {
        builder.named(name, importName);
      }
    } else if (importedType !== "commonjs") {
      throw new Error(`Unexpected interopType "${importedType}"`);
    } else if (importedInterop === "babel") {
      if (isModuleForNode) {
        name = name !== "default" ? name : importedSource;
        const es6Default = `${importedSource}$es6Default`;
        builder.import();

        if (isNamespace) {
          builder.default(es6Default).var(name || importedSource).wildcardInterop();
        } else if (isDefault) {
          if (ensureLiveReference) {
            builder.default(es6Default).var(name || importedSource).defaultInterop().read("default");
          } else {
            builder.default(es6Default).var(name).defaultInterop().prop(importName);
          }
        } else if (isNamed) {
          builder.default(es6Default).read(importName);
        }
      } else if (isModuleForBabel) {
        builder.import();

        if (isNamespace) {
          builder.namespace(name || importedSource);
        } else if (isDefault || isNamed) {
          builder.named(name, importName);
        }
      } else {
        builder.require();

        if (isNamespace) {
          builder.var(name || importedSource).wildcardInterop();
        } else if ((isDefault || isNamed) && ensureLiveReference) {
          if (isDefault) {
            name = name !== "default" ? name : importedSource;
            builder.var(name).read(importName);
            builder.defaultInterop();
          } else {
            builder.var(importedSource).read(importName);
          }
        } else if (isDefault) {
          builder.var(name).defaultInterop().prop(importName);
        } else if (isNamed) {
          builder.var(name).prop(importName);
        }
      }
    } else if (importedInterop === "compiled") {
      if (isModuleForNode) {
        builder.import();

        if (isNamespace) {
          builder.default(name || importedSource);
        } else if (isDefault || isNamed) {
          builder.default(importedSource).read(name);
        }
      } else if (isModuleForBabel) {
        builder.import();

        if (isNamespace) {
          builder.namespace(name || importedSource);
        } else if (isDefault || isNamed) {
          builder.named(name, importName);
        }
      } else {
        builder.require();

        if (isNamespace) {
          builder.var(name || importedSource);
        } else if (isDefault || isNamed) {
          if (ensureLiveReference) {
            builder.var(importedSource).read(name);
          } else {
            builder.prop(importName).var(name);
          }
        }
      }
    } else if (importedInterop === "uncompiled") {
      if (isDefault && ensureLiveReference) {
        throw new Error("No live reference for commonjs default");
      }

      if (isModuleForNode) {
        builder.import();

        if (isNamespace) {
          builder.default(name || importedSource);
        } else if (isDefault) {
          builder.default(name);
        } else if (isNamed) {
          builder.default(importedSource).read(name);
        }
      } else if (isModuleForBabel) {
        builder.import();

        if (isNamespace) {
          builder.default(name || importedSource);
        } else if (isDefault) {
          builder.default(name);
        } else if (isNamed) {
          builder.named(name, importName);
        }
      } else {
        builder.require();

        if (isNamespace) {
          builder.var(name || importedSource);
        } else if (isDefault) {
          builder.var(name);
        } else if (isNamed) {
          if (ensureLiveReference) {
            builder.var(importedSource).read(name);
          } else {
            builder.var(name).prop(importName);
          }
        }
      }
    } else {
      throw new Error(`Unknown importedInterop "${importedInterop}".`);
    }

    const {
      statements,
      resultName
    } = builder.done();

    this._insertStatements(statements, importPosition, blockHoist);

    if ((isDefault || isNamed) && ensureNoContext && resultName.type !== "Identifier") {
      return sequenceExpression([numericLiteral(0), resultName]);
    }

    return resultName;
  }

  _insertStatements(statements, importPosition = "before", blockHoist = 3) {
    const body = this._programPath.get("body");

    if (importPosition === "after") {
      for (let i = body.length - 1; i >= 0; i--) {
        if (body[i].isImportDeclaration()) {
          body[i].insertAfter(statements);
          return;
        }
      }
    } else {
      statements.forEach(node => {
        node._blockHoist = blockHoist;
      });
      const targetPath = body.find(p => {
        const val = p.node._blockHoist;
        return Number.isFinite(val) && val < 4;
      });

      if (targetPath) {
        targetPath.insertBefore(statements);
        return;
      }
    }

    this._programPath.unshiftContainer("body", statements);
  }

}

importInjector.default = ImportInjector;

(function (exports) {

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	Object.defineProperty(exports, "ImportInjector", {
	  enumerable: true,
	  get: function () {
	    return _importInjector.default;
	  }
	});
	exports.addDefault = addDefault;
	exports.addNamed = addNamed;
	exports.addNamespace = addNamespace;
	exports.addSideEffect = addSideEffect;
	Object.defineProperty(exports, "isModule", {
	  enumerable: true,
	  get: function () {
	    return _isModule.default;
	  }
	});

	var _importInjector = importInjector;

	var _isModule = isModule$1;

	function addDefault(path, importedSource, opts) {
	  return new _importInjector.default(path).addDefault(importedSource, opts);
	}

	function addNamed(path, name, importedSource, opts) {
	  return new _importInjector.default(path).addNamed(name, importedSource, opts);
	}

	function addNamespace(path, importedSource, opts) {
	  return new _importInjector.default(path).addNamespace(importedSource, opts);
	}

	function addSideEffect(path, importedSource, opts) {
	  return new _importInjector.default(path).addSideEffect(importedSource, opts);
	}
} (lib));

const renderToString = (node) => {
  const type = node.openingElement.name;
  const attributes = node.openingElement.attributes;
  let html = `<${type.name}`;
  for (let i = 0, j = attributes.length; i < j; i++) {
    const attribute = attributes[i];
    if (!t.isJSXSpreadAttribute(attribute) && attribute?.value && t.isJSXIdentifier(attribute.name) && "value" in attribute.value) {
      const { name } = attribute.name;
      const { value } = attribute.value;
      html += ` ${name}${value ? `="${value}"` : ""}`;
    }
  }
  if (node.selfClosing) {
    html += ` />`;
    return html;
  }
  html += ">";
  if (node.children.length) {
    for (let i = 0, j = node.children.length; i < j; i++) {
      const child = node.children[i];
      if (t.isJSXText(child)) {
        html += child.value.trim();
      } else if (t.isJSXElement(child)) {
        html += renderToString(child);
      } else if (t.isJSXExpressionContainer(child)) {
        if (t.isStringLiteral(child.expression)) {
          html += child.expression.value;
        } else if (t.isNumericLiteral(child.expression)) {
          html += child.expression.value;
        } else if (t.isJSXElement(child.expression)) {
          html += renderToString(child.expression);
        }
      }
    }
  }
  html += `</${type.name}>`;
  return html;
};
const renderToTemplate = (node, edits, path = [], holes = []) => {
  const attributesLength = node.openingElement.attributes.length;
  const current = {
    path,
    edits: [],
    inits: []
  };
  if (attributesLength) {
    const newAttributes = [];
    for (let i = 0; i < attributesLength; ++i) {
      const attribute = node.openingElement.attributes[i];
      if (t.isJSXAttribute(attribute) && t.isJSXIdentifier(attribute.name) && attribute.value) {
        const name = attribute.name.name;
        if (name === "key" || name === "ref" || name === "children") {
          continue;
        }
        if (name === "className")
          attribute.name.name = "class";
        if (name === "htmlFor")
          attribute.name.name = "for";
        if (name.startsWith("on")) {
          if (!t.isJSXExpressionContainer(attribute.value))
            continue;
          const { expression } = attribute.value;
          if (!t.isIdentifier(expression) && !t.isArrowFunctionExpression(expression)) {
            continue;
          }
          const isDynamicListener = t.isIdentifier(expression) && holes.includes(expression.name);
          const event = name.toLowerCase().slice(2);
          if (isDynamicListener) {
            current.edits.push({
              type: t.numericLiteral(EventFlag),
              name: t.stringLiteral(event),
              hole: t.stringLiteral(expression.name)
            });
          } else {
            current.inits.push({
              type: t.numericLiteral(EventFlag),
              listener: expression,
              name: t.stringLiteral(event)
            });
          }
          continue;
        }
        if (name === "style") {
          if (!t.isJSXExpressionContainer(attribute.value))
            continue;
          const { expression } = attribute.value;
          if (!t.isObjectExpression(expression))
            continue;
          let style = "";
          for (let i2 = 0, j = expression.properties.length; i2 < j; ++i2) {
            const property = expression.properties[i2];
            if (!t.isObjectProperty(property) || !t.isIdentifier(property.key) || !t.isStringLiteral(property.value) && !t.isNumericLiteral(property.value))
              continue;
            if (!t.isIdentifier(property.key))
              continue;
            const value = property.value.extra?.raw || "";
            style += `${property.key.name}:${String(value)};`;
          }
          attribute.value = t.stringLiteral(style);
          continue;
        }
        if (t.isJSXExpressionContainer(attribute.value)) {
          if (t.isStringLiteral(attribute.value.expression) || t.isNumericLiteral(attribute.value.expression)) {
            newAttributes.push(
              t.jsxAttribute(
                attribute.name,
                t.stringLiteral(String(attribute.value.expression.value))
              )
            );
            continue;
          }
          const { expression } = attribute.value;
          current.edits.push({
            type: t.numericLiteral(
              name === "style" ? StyleAttributeFlag : name.charCodeAt(0) === X_CHAR ? SvgAttributeFlag : AttributeFlag
            ),
            hole: t.stringLiteral(expression.name),
            name: t.stringLiteral(name)
          });
          continue;
        }
      }
      if (attribute && "value" in attribute && attribute.value && t.isJSXAttribute(attribute)) {
        newAttributes.push(attribute);
      }
    }
    node.openingElement.attributes = newAttributes;
  }
  const newChildren = [];
  for (let i = 0, j = node.children.length || 0, k = 0; i < j; ++i) {
    const child = node.children[i];
    if (t.isJSXExpressionContainer(child) && t.isIdentifier(child.expression) && holes.includes(child.expression.name)) {
      current.edits.push({
        type: t.numericLiteral(ChildFlag),
        hole: t.stringLiteral(child.expression.name),
        index: t.numericLiteral(i),
        name: void 0,
        listener: void 0,
        value: void 0
      });
      continue;
    }
    if (t.isJSXText(child) && (typeof child.value === "string" || typeof child.value === "number" || typeof child.value === "bigint")) {
      const value = String(child.value);
      if (value.trim() === "")
        continue;
      newChildren.push(t.jsxText(value));
      k++;
      continue;
    }
    if (t.isJSXElement(child)) {
      newChildren.push(renderToTemplate(child, edits, path.concat(k++), holes));
    }
  }
  node.children = newChildren;
  if (current.inits.length || current.edits.length) {
    edits.push(current);
  }
  return node;
};

const chainOrLogic = (...binaryExpressions) => {
  if (binaryExpressions.length === 1) {
    return binaryExpressions[0];
  }
  const [first, ...rest] = binaryExpressions;
  return t.logicalExpression(
    "||",
    first,
    chainOrLogic(...rest)
  );
};

const optimize = (path) => {
  if (t.isIdentifier(path.node.callee, { name: "block" })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction)
      return;
    const importSource = blockFunction.path.parent;
    if (!t.isVariableDeclarator(path.parentPath.node) || !t.isImportDeclaration(importSource) || !importSource.source.value.includes("million")) {
      return;
    }
    let [fn, _unwrap, shouldUpdate] = path.node.arguments;
    if (!fn)
      return;
    const [props] = fn.params;
    if (t.isArrowFunctionExpression(fn) && t.isJSXElement(fn.body)) {
      const edits = [];
      const holes = t.isObjectPattern(props) ? Object.keys(props.properties).map((key) => {
        return props.properties[key].key.name;
      }) : [];
      const template = renderToTemplate(fn.body, edits, [], holes);
      const paths = [];
      let maxPathLength = 0;
      for (let i = 0, j = edits.length; i < j; ++i) {
        const path2 = edits[i]?.path || [];
        if (path2.length > maxPathLength)
          maxPathLength = path2.length;
        paths.push(path2);
      }
      const { declarators, accessedIds } = hoistElements(
        paths,
        path,
        importSource
      );
      const editsArray = t.arrayExpression(
        edits.map((edit) => {
          const editsProperties = [];
          const initsProperties = [];
          for (let i = 0, j = edit.edits.length; i < j; ++i) {
            const { type, name, hole, listener, value, index } = edit.edits[i];
            editsProperties.push(
              t.objectExpression([
                t.objectProperty(t.identifier("t"), type),
                t.objectProperty(t.identifier("n"), name ?? t.nullLiteral()),
                t.objectProperty(t.identifier("v"), value ?? t.nullLiteral()),
                t.objectProperty(t.identifier("h"), hole ?? t.nullLiteral()),
                t.objectProperty(t.identifier("i"), index ?? t.nullLiteral()),
                t.objectProperty(
                  t.identifier("l"),
                  listener ?? t.nullLiteral()
                ),
                t.objectProperty(t.identifier("p"), value ?? t.nullLiteral()),
                t.objectProperty(t.identifier("b"), value ?? t.nullLiteral())
              ])
            );
          }
          for (let i = 0, j = edit.inits.length; i < j; ++i) {
            const { type, name, hole, listener, value, index } = edit.inits[i];
            initsProperties.push(
              t.objectExpression([
                t.objectProperty(t.identifier("t"), type),
                t.objectProperty(t.identifier("n"), name ?? t.nullLiteral()),
                t.objectProperty(t.identifier("v"), value ?? t.nullLiteral()),
                t.objectProperty(t.identifier("h"), hole ?? t.nullLiteral()),
                t.objectProperty(t.identifier("i"), index ?? t.nullLiteral()),
                t.objectProperty(
                  t.identifier("l"),
                  listener ?? t.nullLiteral()
                ),
                t.objectProperty(t.identifier("p"), value ?? t.nullLiteral()),
                t.objectProperty(t.identifier("b"), value ?? t.nullLiteral())
              ])
            );
          }
          return t.objectExpression([
            t.objectProperty(t.identifier("p"), t.nullLiteral()),
            t.objectProperty(
              t.identifier("e"),
              t.arrayExpression(editsProperties)
            ),
            t.objectProperty(
              t.identifier("i"),
              initsProperties.length ? t.arrayExpression(initsProperties) : t.nullLiteral()
            )
          ]);
        })
      );
      const stringToDOM = lib.addNamed(
        path,
        "stringToDOM",
        importSource.source.value,
        {
          nameHint: "stringToDOM$"
        }
      );
      const shouldUpdateExists = t.isIdentifier(shouldUpdate) && shouldUpdate.name !== "undefined" || t.isArrowFunctionExpression(shouldUpdate);
      if (!shouldUpdateExists && props && !t.isIdentifier(props)) {
        const { properties } = props;
        shouldUpdate = t.arrowFunctionExpression(
          [t.identifier("oldProps"), t.identifier("newProps")],
          chainOrLogic(
            ...properties.filter((property) => t.isObjectProperty(property)).map((property) => {
              const key = property.key;
              return t.binaryExpression(
                "!==",
                t.optionalMemberExpression(
                  t.identifier("oldProps"),
                  key,
                  false,
                  true
                ),
                t.optionalMemberExpression(
                  t.identifier("newProps"),
                  key,
                  false,
                  true
                )
              );
            })
          )
        );
      }
      const domVariable = path.scope.generateUidIdentifier("dom$");
      const editsVariable = path.scope.generateUidIdentifier("edits$");
      const shouldUpdateVariable = path.scope.generateUidIdentifier("shouldUpdate$");
      const getElementsVariable = path.scope.generateUidIdentifier("getElements$");
      const variables = t.variableDeclaration("const", [
        t.variableDeclarator(
          domVariable,
          t.callExpression(stringToDOM, [
            t.templateLiteral(
              [
                t.templateElement({
                  raw: renderToString(template)
                })
              ],
              []
            )
          ])
        ),
        t.variableDeclarator(editsVariable, editsArray),
        t.variableDeclarator(
          shouldUpdateVariable,
          shouldUpdateExists ? t.nullLiteral() : shouldUpdate
        ),
        t.variableDeclarator(
          getElementsVariable,
          declarators.length ? t.arrowFunctionExpression(
            [t.identifier("root")],
            t.blockStatement([
              t.variableDeclaration("const", declarators),
              t.returnStatement(t.arrayExpression(accessedIds))
            ])
          ) : t.nullLiteral()
        )
      ]);
      const BlockClass = lib.addNamed(path, "Block", importSource.source.value, {
        nameHint: "Block$"
      });
      const blockFactory = t.arrowFunctionExpression(
        [
          t.identifier("props"),
          t.identifier("key"),
          t.identifier("shouldUpdate")
        ],
        t.blockStatement([
          t.returnStatement(
            t.newExpression(BlockClass, [
              domVariable,
              editsVariable,
              t.identifier("props"),
              t.logicalExpression(
                "??",
                t.identifier("key"),
                t.memberExpression(t.identifier("props"), t.identifier("key"))
              ),
              t.logicalExpression(
                "??",
                t.identifier("shouldUpdate"),
                shouldUpdateVariable
              ),
              getElementsVariable
            ])
          )
        ])
      );
      path.parentPath.parentPath?.insertBefore(variables);
      path.replaceWith(t.returnStatement(blockFactory));
    }
  }
};
const hoistElements = (paths, path, importSource) => {
  var _a;
  const createTreeNode = () => ({
    children: [],
    path: void 0
  });
  const createPrunedNode = (index, parent) => ({
    index,
    parent,
    path: void 0,
    child: void 0,
    next: void 0,
    prev: void 0
  });
  const tree = createTreeNode();
  for (let i = 0, j = paths.length; i < j; i++) {
    const path2 = paths[i];
    let prev = tree;
    for (let k = 0, l = path2.length; k < l; k++) {
      const index = path2[k];
      (_a = prev.children)[index] || (_a[index] = createTreeNode());
      prev = prev.children[index];
      if (k === l - 1) {
        prev.path || (prev.path = []);
        prev.path.push(i);
      }
    }
  }
  const prune = (node, parent) => {
    let prev = parent;
    for (let i = 0, j = node.children.length; i < j; i++) {
      const treeNode = node.children[i];
      const current = createPrunedNode(i, parent);
      if (prev === parent) {
        prev.child = current;
      } else {
        current.prev = prev;
        prev.next = current;
      }
      prev = current;
      if (treeNode) {
        prev.path = treeNode.path;
        prune(treeNode, current);
      }
    }
  };
  const root = createPrunedNode(0);
  prune(tree, root);
  const getId = () => path.scope.generateUidIdentifier("el$");
  const firstChild = lib.addNamed(path, "firstChild$", importSource.source.value);
  const nextSibling = lib.addNamed(path, "nextSibling$", importSource.source.value);
  const declarators = [];
  const accessedIds = Array(paths.length).fill(
    t.identifier("root")
  );
  const traverse = (node, prev, isParent) => {
    if (isParent) {
      prev = t.callExpression(
        t.memberExpression(firstChild, t.identifier("call")),
        [prev]
      );
      for (let i = 0, j = node.index; i < j; i++) {
        prev = t.callExpression(
          t.memberExpression(nextSibling, t.identifier("call")),
          [prev]
        );
      }
    } else {
      for (let i = 0, j = node.index - (node.prev?.index ?? 0); i < j; i++) {
        prev = t.callExpression(
          t.memberExpression(nextSibling, t.identifier("call")),
          [prev]
        );
      }
    }
    if (node.child && node.next) {
      const id = getId();
      declarators.push(t.variableDeclarator(id, prev));
      prev = id;
      if (node.path !== void 0) {
        for (let i = 0, j = node.path.length; i < j; ++i) {
          accessedIds[node.path[i]] = id;
        }
      }
    } else if (node.path !== void 0) {
      const id = getId();
      declarators.push(t.variableDeclarator(id, prev));
      for (let i = 0, j = node.path.length; i < j; ++i) {
        accessedIds[node.path[i]] = id;
      }
      prev = id;
    }
    if (node.next) {
      traverse(node.next, prev, false);
    }
    if (node.child) {
      traverse(node.child, prev, true);
    }
  };
  if (root.child) {
    traverse(root.child, t.identifier("root"), true);
  }
  return {
    declarators,
    accessedIds
  };
};

const transformReact = (options = {}) => (path) => {
  options._defer = [];
  if (t.isIdentifier(path.node.callee, { name: "block" })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction)
      return;
    const importSource = blockFunction.path.parent;
    if (!t.isVariableDeclarator(path.parentPath.node) || !t.isImportDeclaration(importSource) || !importSource.source.value.includes("million")) {
      return;
    }
    if (importSource.source.value === "million") {
      importSource.source.value = "million/react";
    }
    if ((options.mode === "next" || options.mode === "react-server") && importSource.source.value === "million/react") {
      importSource.source.value = "million/react-server";
    }
    const componentId = path.node.arguments[0];
    if (!t.isIdentifier(componentId)) {
      throw BlockError(
        "Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.",
        path
      );
    }
    const componentBinding = path.scope.getBinding(componentId.name);
    const component = t.cloneNode(componentBinding.path.node);
    if (t.isFunctionDeclaration(component)) {
      handleComponent(
        path,
        component.body,
        componentBinding,
        component,
        importSource.source.value
      );
    } else if (t.isVariableDeclarator(component) && t.isArrowFunctionExpression(component.init)) {
      handleComponent(
        path,
        component.init.body,
        componentBinding,
        component,
        importSource.source.value
      );
    } else {
      throw BlockError(
        "You can only use block() with a function declaration or arrow function.",
        path
      );
    }
  }
};
const handleComponent = (path, componentFunction, componentBinding, component, sourceName) => {
  if (!t.isBlockStatement(componentFunction)) {
    throw BlockError(
      "Expected a block statement for the component function. Make sure you are using a function declaration or arrow function.",
      path
    );
  }
  const bodyLength = componentFunction.body.length;
  const correctSubPath = t.isVariableDeclarator(component) ? "init.body.body" : "body.body";
  for (let i = 0; i < bodyLength; ++i) {
    const node = componentFunction.body[i];
    if (!t.isIfStatement(node))
      continue;
    if (t.isReturnStatement(node.consequent) || t.isBlockStatement(node.consequent) && node.consequent.body.some((n) => t.isReturnStatement(n))) {
      const ifStatementPath = componentBinding.path.get(
        `${correctSubPath}.${i}.consequent`
      );
      throw BlockError(
        "You cannot use multiple returns in blocks. There can only be one return statement at the end of the block.",
        path,
        ifStatementPath
      );
    }
  }
  const view = componentFunction.body[bodyLength - 1];
  if (t.isReturnStatement(view) && t.isJSXElement(view.argument)) {
    const returnJsxPath = componentBinding.path.get(
      `${correctSubPath}.${bodyLength - 1}.argument`
    );
    const jsx = view.argument;
    const blockVariable = path.scope.generateUidIdentifier("block$");
    const componentVariable = path.scope.generateUidIdentifier("component$");
    const dynamics = getDynamicsFromJSX(path, jsx, sourceName, returnJsxPath);
    const forgettiCompatibleComponentName = t.identifier(
      `useBlock${componentVariable.name}`
    );
    const blockFunction = t.functionDeclaration(
      blockVariable,
      [
        t.objectPattern(
          dynamics.data.map(({ id }) => t.objectProperty(id, id))
        )
      ],
      t.blockStatement([view])
    );
    componentFunction.body[bodyLength - 1] = t.returnStatement(
      t.callExpression(forgettiCompatibleComponentName, [
        t.objectExpression(
          dynamics.data.map(
            ({ id, value }) => t.objectProperty(id, value || id)
          )
        )
      ])
    );
    for (let i = 0; i < dynamics.deferred.length; ++i) {
      dynamics.deferred[i]?.();
    }
    const blockComponent = path.parentPath.node;
    const temp = blockComponent.id;
    blockComponent.id = forgettiCompatibleComponentName;
    component.id = componentVariable;
    path.node.arguments[0] = blockVariable;
    const parentPath = path.parentPath.parentPath;
    if (t.isFunctionDeclaration(component)) {
      parentPath?.insertBefore(component);
    } else {
      parentPath?.insertBefore(t.variableDeclaration("const", [component]));
    }
    parentPath?.insertBefore(blockFunction);
    parentPath?.insertBefore(
      t.variableDeclaration("const", [
        t.variableDeclarator(temp, component.id)
      ])
    );
  }
};
const getDynamicsFromJSX = (path, jsx, sourceName, returnJsxPath, dynamics = { data: [], cache: /* @__PURE__ */ new Set(), deferred: [] }) => {
  const createDynamic = (identifier, expression, callback) => {
    const id = identifier || path.scope.generateUidIdentifier("$");
    if (!dynamics.cache.has(id.name)) {
      dynamics.data.push({ value: expression, id });
      dynamics.cache.add(id.name);
    }
    dynamics.deferred.push(callback);
    return id;
  };
  const type = jsx.openingElement.name;
  if (t.isJSXIdentifier(type)) {
    const componentBinding = path.scope.getBinding(type.name);
    const component = componentBinding?.path.node;
    if (t.isFunctionDeclaration(component) || t.isVariableDeclarator(component) || type.name.startsWith(type.name[0].toUpperCase())) {
      const createElement = lib.addNamed(path, "createElement", "react", {
        nameHint: "createElement$"
      });
      const objectProperties = [];
      for (let i = 0, j = jsx.openingElement.attributes.length; i < j; i++) {
        const attribute = jsx.openingElement.attributes[i];
        if (t.isJSXAttribute(attribute) && t.isJSXExpressionContainer(attribute.value)) {
          const { expression } = attribute.value;
          const name = attribute.name;
          if (t.isIdentifier(expression)) {
            const id2 = createDynamic(expression, null, null);
            if (t.isJSXIdentifier(name)) {
              objectProperties.push(
                t.objectProperty(t.identifier(name.name), id2)
              );
            }
          } else if (t.isExpression(expression)) {
            const id2 = createDynamic(null, expression, () => {
              attribute.value.expression = id2;
            });
            if (t.isJSXIdentifier(name)) {
              objectProperties.push(
                t.objectProperty(t.identifier(name.name), id2)
              );
            }
          }
        }
        if (t.isJSXSpreadAttribute(attribute)) {
          const spreadPath = returnJsxPath.get(
            `openingElement.attributes.${i}.argument`
          );
          throw BlockError(
            "Spread attributes aren't supported.",
            path,
            spreadPath
          );
        }
      }
      BlockWarning(
        "Deoptimization Warning: Components will cause degraded performnace. Ideally, you should use DOM elements instead.",
        returnJsxPath.openingElement
      );
      const renderReactScope = lib.addNamed(path, "renderReactScope", sourceName, {
        nameHint: "renderReactScope$"
      });
      const nestedRender = t.callExpression(renderReactScope, [
        t.callExpression(createElement, [
          t.identifier(type.name),
          t.objectExpression(objectProperties)
        ])
      ]);
      const id = createDynamic(null, nestedRender, null);
      jsx.openingElement.name = t.jsxIdentifier(id.name);
      if (jsx.closingElement) {
        jsx.closingElement.name = t.jsxIdentifier(id.name);
      }
    }
  }
  for (let i = 0, j = jsx.openingElement.attributes.length; i < j; i++) {
    const attribute = jsx.openingElement.attributes[i];
    if (t.isJSXAttribute(attribute) && t.isJSXExpressionContainer(attribute.value)) {
      const { expression } = attribute.value;
      const { leadingComments } = expression;
      if (leadingComments?.length && leadingComments[0]?.value.trim() === "@once") {
        continue;
      }
      if (t.isIdentifier(expression)) {
        createDynamic(expression, null, null);
      } else if (t.isExpression(expression)) {
        const id = createDynamic(null, expression, () => {
          attribute.value.expression = id;
        });
      }
    }
    if (t.isJSXSpreadAttribute(attribute)) {
      const spreadPath = returnJsxPath.get(
        `openingElement.attributes.${i}.argument`
      );
      throw BlockError("Spread attributes aren't supported.", path, spreadPath);
    }
  }
  for (let i = 0, j = jsx.children.length; i < j; i++) {
    const child = jsx.children[i];
    if (t.isJSXExpressionContainer(child)) {
      const { expression } = child;
      const { leadingComments } = expression;
      if (leadingComments?.length && leadingComments[0]?.value.trim() === "@once") {
        continue;
      }
      if (t.isIdentifier(expression)) {
        createDynamic(expression, null, null);
      } else if (t.isJSXElement(expression)) {
        getDynamicsFromJSX(
          path,
          expression,
          sourceName,
          returnJsxPath.get(`children.${i}`),
          dynamics
        );
        jsx.children[i] = expression;
      } else if (t.isExpression(expression)) {
        if (t.isCallExpression(expression) && t.isMemberExpression(expression.callee) && t.isIdentifier(expression.callee.property, { name: "map" })) {
          const For = lib.addNamed(path, "For", sourceName, {
            nameHint: "For$"
          });
          const jsxFor = t.jsxIdentifier(For.name);
          const newJsxArrayIterator = t.jsxElement(
            t.jsxOpeningElement(jsxFor, [
              t.jsxAttribute(
                t.jsxIdentifier("each"),
                t.jsxExpressionContainer(expression.callee.object)
              )
            ]),
            t.jsxClosingElement(jsxFor),
            [t.jsxExpressionContainer(expression.arguments[0])]
          );
          const expressionPath = returnJsxPath.get(`children.${i}.expression`);
          BlockWarning(
            "Deoptimization Warning: Array.map() will degrade performance. We recommend removing the block on the current component and using a <For /> component instead.",
            expressionPath
          );
          const renderReactScope = lib.addNamed(
            path,
            "renderReactScope",
            sourceName,
            {
              nameHint: "renderReactScope$"
            }
          );
          const nestedRender = t.callExpression(renderReactScope, [
            newJsxArrayIterator
          ]);
          const id2 = createDynamic(null, nestedRender, () => {
            jsx.children[i] = t.jsxExpressionContainer(id2);
          });
          continue;
        }
        if (t.isConditionalExpression(expression) || t.isLogicalExpression(expression)) {
          const expressionPath = returnJsxPath.get(`children.${i}.expression`);
          BlockWarning(
            "Deoptimization Warning: Conditional expressions will degrade performance. We recommend using deterministic returns instead.",
            expressionPath
          );
          const renderReactScope = lib.addNamed(
            path,
            "renderReactScope",
            sourceName,
            {
              nameHint: "renderReactScope$"
            }
          );
          const id2 = createDynamic(
            null,
            t.callExpression(renderReactScope, [expression]),
            () => {
              jsx.children[i] = t.jsxExpressionContainer(id2);
            }
          );
          continue;
        }
        const id = createDynamic(null, expression, () => {
          child.expression = id;
        });
      }
    } else if (t.isJSXElement(child)) {
      getDynamicsFromJSX(
        path,
        child,
        sourceName,
        returnJsxPath.get(`children.${i}`),
        dynamics
      );
    }
  }
  return dynamics;
};
const BlockError = (message, path, localPath) => {
  if (t.isVariableDeclarator(path.parentPath.node) && t.isIdentifier(path.node.arguments[0])) {
    path.parentPath.node.init = path.node.arguments[0];
  }
  return (localPath ?? path).buildCodeFrameError(message);
};
const BlockWarning = (message, localPath) => {
  const err = localPath.buildCodeFrameError(message);
  console.warn(err.message);
};

const babelPlugin = declare_1((api, options) => {
  api.assertVersion(7);
  const callExpressionHandler = options.mode === "optimize" ? optimize : transformReact(options);
  return {
    name: "million",
    visitor: {
      CallExpression(path) {
        callExpressionHandler(path);
      }
    }
  };
});

const unplugin = createUnplugin((options) => {
  return {
    enforce: "pre",
    name: "million",
    transformInclude(id) {
      return /\.[jt]sx$/.test(id);
    },
    async transform(code, id) {
      if (options?.ignoreFiles?.some((pattern) => id.match(pattern))) {
        return code;
      }
      const plugins = ["@babel/plugin-syntax-jsx"];
      if (id.endsWith(".tsx")) {
        plugins.push(["@babel/plugin-syntax-typescript", { isTSX: true }]);
      }
      const result = await transformAsync(code, {
        plugins: [...plugins, [babelPlugin, options]]
      });
      code = result?.code ?? code;
      return code;
    }
  };
});
const next = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack(config, options) {
      config.plugins.unshift(unplugin.webpack({ mode: "react-server" }));
      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }
      return config;
    }
  };
};
unplugin.next = next;

export { babelPlugin, unplugin as default, next, unplugin };
