'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const unplugin$1 = require('unplugin');
const core = require('@babel/core');
const require$$0 = require('assert');
const t = require('@babel/types');
const constants = require('./chunks/constants.cjs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e["default"] : e; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  const n = Object.create(null);
  if (e) {
    for (const k in e) {
      n[k] = e[k];
    }
  }
  n["default"] = e;
  return n;
}

const require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
const t__default = /*#__PURE__*/_interopDefaultLegacy(t);
const t__namespace = /*#__PURE__*/_interopNamespace(t);

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

var _assert$1 = require$$0__default;

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

var _assert = require$$0__default;

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
    if (!t__namespace.isJSXSpreadAttribute(attribute) && attribute?.value && t__namespace.isJSXIdentifier(attribute.name) && "value" in attribute.value) {
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
      if (t__namespace.isJSXText(child)) {
        html += child.value.trim();
      } else if (t__namespace.isJSXElement(child)) {
        html += renderToString(child);
      } else if (t__namespace.isJSXExpressionContainer(child)) {
        if (t__namespace.isStringLiteral(child.expression)) {
          html += child.expression.value;
        } else if (t__namespace.isNumericLiteral(child.expression)) {
          html += child.expression.value;
        } else if (t__namespace.isJSXElement(child.expression)) {
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
      if (t__namespace.isJSXAttribute(attribute) && t__namespace.isJSXIdentifier(attribute.name) && attribute.value) {
        const name = attribute.name.name;
        if (name === "key" || name === "ref" || name === "children") {
          continue;
        }
        if (name === "className")
          attribute.name.name = "class";
        if (name === "htmlFor")
          attribute.name.name = "for";
        if (name.startsWith("on")) {
          if (!t__namespace.isJSXExpressionContainer(attribute.value))
            continue;
          const { expression } = attribute.value;
          if (!t__namespace.isIdentifier(expression) && !t__namespace.isArrowFunctionExpression(expression)) {
            continue;
          }
          const isDynamicListener = t__namespace.isIdentifier(expression) && holes.includes(expression.name);
          const event = name.toLowerCase().slice(2);
          if (isDynamicListener) {
            current.edits.push({
              type: t__namespace.numericLiteral(constants.EventFlag),
              name: t__namespace.stringLiteral(event),
              hole: t__namespace.stringLiteral(expression.name)
            });
          } else {
            current.inits.push({
              type: t__namespace.numericLiteral(constants.EventFlag),
              listener: expression,
              name: t__namespace.stringLiteral(event)
            });
          }
          continue;
        }
        if (name === "style") {
          if (!t__namespace.isJSXExpressionContainer(attribute.value))
            continue;
          const { expression } = attribute.value;
          if (!t__namespace.isObjectExpression(expression))
            continue;
          let style = "";
          for (let i2 = 0, j = expression.properties.length; i2 < j; ++i2) {
            const property = expression.properties[i2];
            if (!t__namespace.isObjectProperty(property) || !t__namespace.isIdentifier(property.key) || !t__namespace.isStringLiteral(property.value) && !t__namespace.isNumericLiteral(property.value))
              continue;
            if (!t__namespace.isIdentifier(property.key))
              continue;
            const value = property.value.extra?.raw || "";
            style += `${property.key.name}:${String(value)};`;
          }
          attribute.value = t__namespace.stringLiteral(style);
          continue;
        }
        if (t__namespace.isJSXExpressionContainer(attribute.value)) {
          if (t__namespace.isStringLiteral(attribute.value.expression) || t__namespace.isNumericLiteral(attribute.value.expression)) {
            newAttributes.push(
              t__namespace.jsxAttribute(
                attribute.name,
                t__namespace.stringLiteral(String(attribute.value.expression.value))
              )
            );
            continue;
          }
          const { expression } = attribute.value;
          current.edits.push({
            type: t__namespace.numericLiteral(
              name === "style" ? constants.StyleAttributeFlag : name.charCodeAt(0) === constants.X_CHAR ? constants.SvgAttributeFlag : constants.AttributeFlag
            ),
            hole: t__namespace.stringLiteral(expression.name),
            name: t__namespace.stringLiteral(name)
          });
          continue;
        }
      }
      if (attribute && "value" in attribute && attribute.value && t__namespace.isJSXAttribute(attribute)) {
        newAttributes.push(attribute);
      }
    }
    node.openingElement.attributes = newAttributes;
  }
  const newChildren = [];
  for (let i = 0, j = node.children.length || 0, k = 0; i < j; ++i) {
    const child = node.children[i];
    if (t__namespace.isJSXExpressionContainer(child) && t__namespace.isIdentifier(child.expression) && holes.includes(child.expression.name)) {
      current.edits.push({
        type: t__namespace.numericLiteral(constants.ChildFlag),
        hole: t__namespace.stringLiteral(child.expression.name),
        index: t__namespace.numericLiteral(i),
        name: void 0,
        listener: void 0,
        value: void 0
      });
      continue;
    }
    if (t__namespace.isJSXText(child) && (typeof child.value === "string" || typeof child.value === "number" || typeof child.value === "bigint")) {
      const value = String(child.value);
      if (value.trim() === "")
        continue;
      newChildren.push(t__namespace.jsxText(value));
      k++;
      continue;
    }
    if (t__namespace.isJSXElement(child)) {
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
  return t__namespace.logicalExpression(
    "||",
    first,
    chainOrLogic(...rest)
  );
};

const optimize = (path) => {
  if (t__namespace.isIdentifier(path.node.callee, { name: "block" })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction)
      return;
    const importSource = blockFunction.path.parent;
    if (!t__namespace.isVariableDeclarator(path.parentPath.node) || !t__namespace.isImportDeclaration(importSource) || !importSource.source.value.includes("million")) {
      return;
    }
    let [fn, _unwrap, shouldUpdate] = path.node.arguments;
    if (!fn)
      return;
    const [props] = fn.params;
    if (t__namespace.isArrowFunctionExpression(fn) && t__namespace.isJSXElement(fn.body)) {
      const edits = [];
      const holes = t__namespace.isObjectPattern(props) ? Object.keys(props.properties).map((key) => {
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
      const editsArray = t__namespace.arrayExpression(
        edits.map((edit) => {
          const editsProperties = [];
          const initsProperties = [];
          for (let i = 0, j = edit.edits.length; i < j; ++i) {
            const { type, name, hole, listener, value, index } = edit.edits[i];
            editsProperties.push(
              t__namespace.objectExpression([
                t__namespace.objectProperty(t__namespace.identifier("t"), type),
                t__namespace.objectProperty(t__namespace.identifier("n"), name ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("v"), value ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("h"), hole ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("i"), index ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(
                  t__namespace.identifier("l"),
                  listener ?? t__namespace.nullLiteral()
                ),
                t__namespace.objectProperty(t__namespace.identifier("p"), value ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("b"), value ?? t__namespace.nullLiteral())
              ])
            );
          }
          for (let i = 0, j = edit.inits.length; i < j; ++i) {
            const { type, name, hole, listener, value, index } = edit.inits[i];
            initsProperties.push(
              t__namespace.objectExpression([
                t__namespace.objectProperty(t__namespace.identifier("t"), type),
                t__namespace.objectProperty(t__namespace.identifier("n"), name ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("v"), value ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("h"), hole ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("i"), index ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(
                  t__namespace.identifier("l"),
                  listener ?? t__namespace.nullLiteral()
                ),
                t__namespace.objectProperty(t__namespace.identifier("p"), value ?? t__namespace.nullLiteral()),
                t__namespace.objectProperty(t__namespace.identifier("b"), value ?? t__namespace.nullLiteral())
              ])
            );
          }
          return t__namespace.objectExpression([
            t__namespace.objectProperty(t__namespace.identifier("p"), t__namespace.nullLiteral()),
            t__namespace.objectProperty(
              t__namespace.identifier("e"),
              t__namespace.arrayExpression(editsProperties)
            ),
            t__namespace.objectProperty(
              t__namespace.identifier("i"),
              initsProperties.length ? t__namespace.arrayExpression(initsProperties) : t__namespace.nullLiteral()
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
      const shouldUpdateExists = t__namespace.isIdentifier(shouldUpdate) && shouldUpdate.name !== "undefined" || t__namespace.isArrowFunctionExpression(shouldUpdate);
      if (!shouldUpdateExists && props && !t__namespace.isIdentifier(props)) {
        const { properties } = props;
        shouldUpdate = t__namespace.arrowFunctionExpression(
          [t__namespace.identifier("oldProps"), t__namespace.identifier("newProps")],
          chainOrLogic(
            ...properties.filter((property) => t__namespace.isObjectProperty(property)).map((property) => {
              const key = property.key;
              return t__namespace.binaryExpression(
                "!==",
                t__namespace.optionalMemberExpression(
                  t__namespace.identifier("oldProps"),
                  key,
                  false,
                  true
                ),
                t__namespace.optionalMemberExpression(
                  t__namespace.identifier("newProps"),
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
      const variables = t__namespace.variableDeclaration("const", [
        t__namespace.variableDeclarator(
          domVariable,
          t__namespace.callExpression(stringToDOM, [
            t__namespace.templateLiteral(
              [
                t__namespace.templateElement({
                  raw: renderToString(template)
                })
              ],
              []
            )
          ])
        ),
        t__namespace.variableDeclarator(editsVariable, editsArray),
        t__namespace.variableDeclarator(
          shouldUpdateVariable,
          shouldUpdateExists ? t__namespace.nullLiteral() : shouldUpdate
        ),
        t__namespace.variableDeclarator(
          getElementsVariable,
          declarators.length ? t__namespace.arrowFunctionExpression(
            [t__namespace.identifier("root")],
            t__namespace.blockStatement([
              t__namespace.variableDeclaration("const", declarators),
              t__namespace.returnStatement(t__namespace.arrayExpression(accessedIds))
            ])
          ) : t__namespace.nullLiteral()
        )
      ]);
      const BlockClass = lib.addNamed(path, "Block", importSource.source.value, {
        nameHint: "Block$"
      });
      const blockFactory = t__namespace.arrowFunctionExpression(
        [
          t__namespace.identifier("props"),
          t__namespace.identifier("key"),
          t__namespace.identifier("shouldUpdate")
        ],
        t__namespace.blockStatement([
          t__namespace.returnStatement(
            t__namespace.newExpression(BlockClass, [
              domVariable,
              editsVariable,
              t__namespace.identifier("props"),
              t__namespace.logicalExpression(
                "??",
                t__namespace.identifier("key"),
                t__namespace.memberExpression(t__namespace.identifier("props"), t__namespace.identifier("key"))
              ),
              t__namespace.logicalExpression(
                "??",
                t__namespace.identifier("shouldUpdate"),
                shouldUpdateVariable
              ),
              getElementsVariable
            ])
          )
        ])
      );
      path.parentPath.parentPath?.insertBefore(variables);
      path.replaceWith(t__namespace.returnStatement(blockFactory));
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
    t__namespace.identifier("root")
  );
  const traverse = (node, prev, isParent) => {
    if (isParent) {
      prev = t__namespace.callExpression(
        t__namespace.memberExpression(firstChild, t__namespace.identifier("call")),
        [prev]
      );
      for (let i = 0, j = node.index; i < j; i++) {
        prev = t__namespace.callExpression(
          t__namespace.memberExpression(nextSibling, t__namespace.identifier("call")),
          [prev]
        );
      }
    } else {
      for (let i = 0, j = node.index - (node.prev?.index ?? 0); i < j; i++) {
        prev = t__namespace.callExpression(
          t__namespace.memberExpression(nextSibling, t__namespace.identifier("call")),
          [prev]
        );
      }
    }
    if (node.child && node.next) {
      const id = getId();
      declarators.push(t__namespace.variableDeclarator(id, prev));
      prev = id;
      if (node.path !== void 0) {
        for (let i = 0, j = node.path.length; i < j; ++i) {
          accessedIds[node.path[i]] = id;
        }
      }
    } else if (node.path !== void 0) {
      const id = getId();
      declarators.push(t__namespace.variableDeclarator(id, prev));
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
    traverse(root.child, t__namespace.identifier("root"), true);
  }
  return {
    declarators,
    accessedIds
  };
};

const transformReact = (options = {}) => (path) => {
  options._defer = [];
  if (t__namespace.isIdentifier(path.node.callee, { name: "block" })) {
    const blockFunction = path.scope.getBinding(path.node.callee.name);
    if (!blockFunction)
      return;
    const importSource = blockFunction.path.parent;
    if (!t__namespace.isVariableDeclarator(path.parentPath.node) || !t__namespace.isImportDeclaration(importSource) || !importSource.source.value.includes("million")) {
      return;
    }
    if (importSource.source.value === "million") {
      importSource.source.value = "million/react";
    }
    if ((options.mode === "next" || options.mode === "react-server") && importSource.source.value === "million/react") {
      importSource.source.value = "million/react-server";
    }
    const componentId = path.node.arguments[0];
    if (!t__namespace.isIdentifier(componentId)) {
      throw BlockError(
        "Found unsupported argument for block. Make sure blocks consume the reference to a component function, not the direct declaration.",
        path
      );
    }
    const componentBinding = path.scope.getBinding(componentId.name);
    const component = t__namespace.cloneNode(componentBinding.path.node);
    if (t__namespace.isFunctionDeclaration(component)) {
      handleComponent(
        path,
        component.body,
        componentBinding,
        component,
        importSource.source.value
      );
    } else if (t__namespace.isVariableDeclarator(component) && t__namespace.isArrowFunctionExpression(component.init)) {
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
  if (!t__namespace.isBlockStatement(componentFunction)) {
    throw BlockError(
      "Expected a block statement for the component function. Make sure you are using a function declaration or arrow function.",
      path
    );
  }
  const bodyLength = componentFunction.body.length;
  const correctSubPath = t__namespace.isVariableDeclarator(component) ? "init.body.body" : "body.body";
  for (let i = 0; i < bodyLength; ++i) {
    const node = componentFunction.body[i];
    if (!t__namespace.isIfStatement(node))
      continue;
    if (t__namespace.isReturnStatement(node.consequent) || t__namespace.isBlockStatement(node.consequent) && node.consequent.body.some((n) => t__namespace.isReturnStatement(n))) {
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
  if (t__namespace.isReturnStatement(view) && t__namespace.isJSXElement(view.argument)) {
    const returnJsxPath = componentBinding.path.get(
      `${correctSubPath}.${bodyLength - 1}.argument`
    );
    const jsx = view.argument;
    const blockVariable = path.scope.generateUidIdentifier("block$");
    const componentVariable = path.scope.generateUidIdentifier("component$");
    const dynamics = getDynamicsFromJSX(path, jsx, sourceName, returnJsxPath);
    const forgettiCompatibleComponentName = t__namespace.identifier(
      `useBlock${componentVariable.name}`
    );
    const blockFunction = t__namespace.functionDeclaration(
      blockVariable,
      [
        t__namespace.objectPattern(
          dynamics.data.map(({ id }) => t__namespace.objectProperty(id, id))
        )
      ],
      t__namespace.blockStatement([view])
    );
    componentFunction.body[bodyLength - 1] = t__namespace.returnStatement(
      t__namespace.callExpression(forgettiCompatibleComponentName, [
        t__namespace.objectExpression(
          dynamics.data.map(
            ({ id, value }) => t__namespace.objectProperty(id, value || id)
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
    if (t__namespace.isFunctionDeclaration(component)) {
      parentPath?.insertBefore(component);
    } else {
      parentPath?.insertBefore(t__namespace.variableDeclaration("const", [component]));
    }
    parentPath?.insertBefore(blockFunction);
    parentPath?.insertBefore(
      t__namespace.variableDeclaration("const", [
        t__namespace.variableDeclarator(temp, component.id)
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
  if (t__namespace.isJSXIdentifier(type)) {
    const componentBinding = path.scope.getBinding(type.name);
    const component = componentBinding?.path.node;
    if (t__namespace.isFunctionDeclaration(component) || t__namespace.isVariableDeclarator(component) || type.name.startsWith(type.name[0].toUpperCase())) {
      const createElement = lib.addNamed(path, "createElement", "react", {
        nameHint: "createElement$"
      });
      const objectProperties = [];
      for (let i = 0, j = jsx.openingElement.attributes.length; i < j; i++) {
        const attribute = jsx.openingElement.attributes[i];
        if (t__namespace.isJSXAttribute(attribute) && t__namespace.isJSXExpressionContainer(attribute.value)) {
          const { expression } = attribute.value;
          const name = attribute.name;
          if (t__namespace.isIdentifier(expression)) {
            const id2 = createDynamic(expression, null, null);
            if (t__namespace.isJSXIdentifier(name)) {
              objectProperties.push(
                t__namespace.objectProperty(t__namespace.identifier(name.name), id2)
              );
            }
          } else if (t__namespace.isExpression(expression)) {
            const id2 = createDynamic(null, expression, () => {
              attribute.value.expression = id2;
            });
            if (t__namespace.isJSXIdentifier(name)) {
              objectProperties.push(
                t__namespace.objectProperty(t__namespace.identifier(name.name), id2)
              );
            }
          }
        }
        if (t__namespace.isJSXSpreadAttribute(attribute)) {
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
      const nestedRender = t__namespace.callExpression(renderReactScope, [
        t__namespace.callExpression(createElement, [
          t__namespace.identifier(type.name),
          t__namespace.objectExpression(objectProperties)
        ])
      ]);
      const id = createDynamic(null, nestedRender, null);
      jsx.openingElement.name = t__namespace.jsxIdentifier(id.name);
      if (jsx.closingElement) {
        jsx.closingElement.name = t__namespace.jsxIdentifier(id.name);
      }
    }
  }
  for (let i = 0, j = jsx.openingElement.attributes.length; i < j; i++) {
    const attribute = jsx.openingElement.attributes[i];
    if (t__namespace.isJSXAttribute(attribute) && t__namespace.isJSXExpressionContainer(attribute.value)) {
      const { expression } = attribute.value;
      const { leadingComments } = expression;
      if (leadingComments?.length && leadingComments[0]?.value.trim() === "@once") {
        continue;
      }
      if (t__namespace.isIdentifier(expression)) {
        createDynamic(expression, null, null);
      } else if (t__namespace.isExpression(expression)) {
        const id = createDynamic(null, expression, () => {
          attribute.value.expression = id;
        });
      }
    }
    if (t__namespace.isJSXSpreadAttribute(attribute)) {
      const spreadPath = returnJsxPath.get(
        `openingElement.attributes.${i}.argument`
      );
      throw BlockError("Spread attributes aren't supported.", path, spreadPath);
    }
  }
  for (let i = 0, j = jsx.children.length; i < j; i++) {
    const child = jsx.children[i];
    if (t__namespace.isJSXExpressionContainer(child)) {
      const { expression } = child;
      const { leadingComments } = expression;
      if (leadingComments?.length && leadingComments[0]?.value.trim() === "@once") {
        continue;
      }
      if (t__namespace.isIdentifier(expression)) {
        createDynamic(expression, null, null);
      } else if (t__namespace.isJSXElement(expression)) {
        getDynamicsFromJSX(
          path,
          expression,
          sourceName,
          returnJsxPath.get(`children.${i}`),
          dynamics
        );
        jsx.children[i] = expression;
      } else if (t__namespace.isExpression(expression)) {
        if (t__namespace.isCallExpression(expression) && t__namespace.isMemberExpression(expression.callee) && t__namespace.isIdentifier(expression.callee.property, { name: "map" })) {
          const For = lib.addNamed(path, "For", sourceName, {
            nameHint: "For$"
          });
          const jsxFor = t__namespace.jsxIdentifier(For.name);
          const newJsxArrayIterator = t__namespace.jsxElement(
            t__namespace.jsxOpeningElement(jsxFor, [
              t__namespace.jsxAttribute(
                t__namespace.jsxIdentifier("each"),
                t__namespace.jsxExpressionContainer(expression.callee.object)
              )
            ]),
            t__namespace.jsxClosingElement(jsxFor),
            [t__namespace.jsxExpressionContainer(expression.arguments[0])]
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
          const nestedRender = t__namespace.callExpression(renderReactScope, [
            newJsxArrayIterator
          ]);
          const id2 = createDynamic(null, nestedRender, () => {
            jsx.children[i] = t__namespace.jsxExpressionContainer(id2);
          });
          continue;
        }
        if (t__namespace.isConditionalExpression(expression) || t__namespace.isLogicalExpression(expression)) {
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
            t__namespace.callExpression(renderReactScope, [expression]),
            () => {
              jsx.children[i] = t__namespace.jsxExpressionContainer(id2);
            }
          );
          continue;
        }
        const id = createDynamic(null, expression, () => {
          child.expression = id;
        });
      }
    } else if (t__namespace.isJSXElement(child)) {
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
  if (t__namespace.isVariableDeclarator(path.parentPath.node) && t__namespace.isIdentifier(path.node.arguments[0])) {
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

const unplugin = unplugin$1.createUnplugin((options) => {
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
      const result = await core.transformAsync(code, {
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

exports.babelPlugin = babelPlugin;
exports["default"] = unplugin;
exports.next = next;
exports.unplugin = unplugin;
