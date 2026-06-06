import { readFileSync } from "node:fs";
import ts from "typescript";

type RuntimeGuardIssue = {
  line: number;
  column: number;
  message: string;
};

const runtimeValueMethods = new Set([
  "appendVariable",
  "askForInput",
  "base64Decode",
  "base64Encode",
  "chooseFromList",
  "detectDictionary",
  "dictionary",
  "getContentsOfURL",
  "getDictionaryValue",
  "getItemFromList",
  "if",
  "matchText",
  "replaceText",
  "setVariable",
  "splitText",
  "text",
  "url",
  "variable",
]);

const chainRuntimeMethods = new Set([
  "append",
  "base64Decode",
  "base64Encode",
  "get",
  "getDictionaryValue",
  "getItem",
  "match",
  "replace",
  "set",
  "split",
]);

const conditionMethods = new Set([
  "beginsWith",
  "contains",
  "doesNotContain",
  "doesNotExist",
  "endsWith",
  "equals",
  "exists",
  "notEquals",
]);

const ifResultSelfReferenceMessage = "Do not reference an If result inside the same shortcut.if(...) branches. The If result is only available after that If control flow ends.";

/**
 * 在导入用户模块前检查常见运行期值原生语法误用。
 */
export function assertNoRuntimeSyntaxMisuse(inputPath: string): void {
  const sourceText = readFileSync(inputPath, "utf8");
  const sourceFile = ts.createSourceFile(inputPath, sourceText, ts.ScriptTarget.Latest, true);
  const issues = collectRuntimeGuardIssues(sourceFile);

  if (issues.length === 0) {
    return;
  }

  const details = issues
    .map((issue) => `${inputPath}:${issue.line}:${issue.column} ${issue.message}`)
    .join("\n");

  throw new Error(`ShortcutsFlow runtime values cannot use native TypeScript control flow.\n${details}`);
}

/**
 * 收集源文件中的运行期值原生语法误用。
 */
function collectRuntimeGuardIssues(sourceFile: ts.SourceFile): RuntimeGuardIssue[] {
  const issues: RuntimeGuardIssue[] = [];
  const scopes: Array<Set<string>> = [new Set()];

  const currentScope = (): Set<string> => scopes[scopes.length - 1] as Set<string>;
  const isRuntimeIdentifier = (node: ts.Node): boolean =>
    ts.isIdentifier(node) && scopes.some((scope) => scope.has(node.text));
  const addIssue = (node: ts.Node, message: string): void => {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    issues.push({
      line: position.line + 1,
      column: position.character + 1,
      message,
    });
  };

  const visit = (node: ts.Node): void => {
    if (isFunctionLikeWithBody(node)) {
      scopes.push(new Set());
      ts.forEachChild(node, visit);
      scopes.pop();
      return;
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      checkIfResultSelfReference(node.name, node.initializer, addIssue);

      if (isRuntimeValueExpression(node.initializer, isRuntimeIdentifier)) {
        currentScope().add(node.name.text);
      }
    }

    if (ts.isIfStatement(node) && isRuntimeValueExpression(node.expression, isRuntimeIdentifier)) {
      addIssue(node.expression, "Use shortcut.if(value.exists(), ...) or shortcut.when(value.exists(), ...) instead of native if.");
    }

    if (ts.isConditionalExpression(node) && isRuntimeValueExpression(node.condition, isRuntimeIdentifier)) {
      addIssue(node.condition, "Use shortcut.if/shortcut.when instead of native ternary expressions for runtime values.");
    }

    if (ts.isBinaryExpression(node)) {
      checkIfResultAssignmentSelfReference(node, addIssue);
      checkBinaryExpression(node, isRuntimeIdentifier, addIssue);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return issues;
}

/**
 * 判断节点是否是拥有函数体的函数节点。
 */
function isFunctionLikeWithBody(node: ts.Node): boolean {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  ) && node.body !== undefined;
}

/**
 * 检查 If 返回值是否在自身分支中被引用。
 */
function checkIfResultSelfReference(
  resultName: ts.Identifier,
  initializer: ts.Expression,
  addIssue: (node: ts.Node, message: string) => void,
): void {
  for (const branchBody of findShortcutIfBranchBodies(initializer)) {
    const reference = findIdentifierReference(branchBody, resultName.text);

    if (reference) {
      addIssue(reference, ifResultSelfReferenceMessage);
    }
  }
}

/**
 * 检查赋值形式的 If 返回值是否在自身分支中被引用。
 */
function checkIfResultAssignmentSelfReference(
  node: ts.BinaryExpression,
  addIssue: (node: ts.Node, message: string) => void,
): void {
  if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier(node.left)) {
    return;
  }

  checkIfResultSelfReference(node.left, node.right, addIssue);
}

/**
 * 读取 shortcut.if 调用中的 then 和 otherwise 分支函数体。
 */
function findShortcutIfBranchBodies(initializer: ts.Expression): ts.Node[] {
  const expression = unwrapExpression(initializer);

  if (!ts.isCallExpression(expression) || !isShortcutIfCall(expression)) {
    return [];
  }

  const branches = expression.arguments[1];

  if (!branches || !ts.isObjectLiteralExpression(branches)) {
    return [];
  }

  return branches.properties.flatMap((property) => {
    if (ts.isPropertyAssignment(property) && isIfBranchPropertyName(property.name)) {
      return getFunctionBody(property.initializer);
    }

    if (ts.isMethodDeclaration(property) && isIfBranchPropertyName(property.name)) {
      return property.body ? [property.body] : [];
    }

    return [];
  });
}

/**
 * 判断调用表达式是否是 shortcut.if(...)。
 */
function isShortcutIfCall(node: ts.CallExpression): boolean {
  const callee = node.expression;

  return ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === "shortcut" &&
    callee.name.text === "if";
}

/**
 * 判断对象属性名是否是 If 分支字段。
 */
function isIfBranchPropertyName(name: ts.PropertyName): boolean {
  return (
    (ts.isIdentifier(name) || ts.isStringLiteral(name)) &&
    (name.text === "then" || name.text === "otherwise")
  );
}

/**
 * 读取函数表达式的函数体节点。
 */
function getFunctionBody(node: ts.Expression): ts.Node[] {
  if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.body) {
    return [node.body];
  }

  return [];
}

/**
 * 查找指定标识符的真实引用位置。
 */
function findIdentifierReference(root: ts.Node, name: string): ts.Identifier | undefined {
  let reference: ts.Identifier | undefined;

  const visit = (node: ts.Node): void => {
    if (reference) {
      return;
    }

    if (isFunctionLikeWithBody(node) && functionLikeShadowsName(node, name)) {
      return;
    }

    if (ts.isBlock(node) && blockDeclaresName(node, name)) {
      return;
    }

    if (bindingDeclarationDeclaresName(node, name)) {
      return;
    }

    if (ts.isIdentifier(node) && node.text === name && isIdentifierReference(node)) {
      reference = node;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(root);
  return reference;
}

/**
 * 判断函数节点是否声明了同名局部绑定。
 */
function functionLikeShadowsName(node: ts.Node, name: string): boolean {
  if (
    !ts.isFunctionDeclaration(node) &&
    !ts.isFunctionExpression(node) &&
    !ts.isArrowFunction(node) &&
    !ts.isMethodDeclaration(node) &&
    !ts.isConstructorDeclaration(node) &&
    !ts.isGetAccessorDeclaration(node) &&
    !ts.isSetAccessorDeclaration(node)
  ) {
    return false;
  }

  if (
    (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
    node.name?.text === name
  ) {
    return true;
  }

  return node.parameters.some((parameter: ts.ParameterDeclaration) =>
    bindingNameMatches(parameter.name, name)
  );
}

/**
 * 判断代码块的直接语句是否声明了同名局部绑定。
 */
function blockDeclaresName(block: ts.Block, name: string): boolean {
  return block.statements.some((statement) => {
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations.some((declaration) =>
        bindingNameMatches(declaration.name, name)
      );
    }

    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      return statement.name?.text === name;
    }

    return false;
  });
}

/**
 * 判断声明节点是否声明了指定绑定名。
 */
function bindingDeclarationDeclaresName(node: ts.Node, name: string): boolean {
  return (
    (ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node)) &&
    bindingNameMatches(node.name, name)
  );
}

/**
 * 判断绑定名或解构绑定中是否包含指定名称。
 */
function bindingNameMatches(bindingName: ts.BindingName, name: string): boolean {
  if (ts.isIdentifier(bindingName)) {
    return bindingName.text === name;
  }

  return bindingName.elements.some((element) =>
    !ts.isOmittedExpression(element) && bindingNameMatches(element.name, name)
  );
}

/**
 * 判断标识符是否是表达式中的读取引用。
 */
function isIdentifierReference(node: ts.Identifier): boolean {
  const parent = node.parent;

  if (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isPropertyDeclaration(parent) && parent.name === node) ||
    (ts.isVariableDeclaration(parent) && parent.name === node) ||
    (ts.isParameter(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) && parent.name === node) ||
    (ts.isFunctionDeclaration(parent) && parent.name === node) ||
    (ts.isFunctionExpression(parent) && parent.name === node) ||
    (ts.isClassDeclaration(parent) && parent.name === node) ||
    (ts.isImportSpecifier(parent) && parent.name === node)
  ) {
    return false;
  }

  return true;
}

/**
 * 检查运行期值在二元表达式中的原生语法误用。
 */
function checkBinaryExpression(
  node: ts.BinaryExpression,
  isRuntimeIdentifier: (node: ts.Node) => boolean,
  addIssue: (node: ts.Node, message: string) => void,
): void {
  const leftIsRuntime = isRuntimeValueExpression(node.left, isRuntimeIdentifier);
  const rightIsRuntime = isRuntimeValueExpression(node.right, isRuntimeIdentifier);

  if (!leftIsRuntime && !rightIsRuntime) {
    return;
  }

  switch (node.operatorToken.kind) {
    case ts.SyntaxKind.AmpersandAmpersandToken:
    case ts.SyntaxKind.BarBarToken:
      addIssue(node, "Use shortcut.if/shortcut.when instead of native && or || for runtime values.");
      return;

    case ts.SyntaxKind.EqualsEqualsToken:
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      addIssue(node, "Use value.equals(other) or shortcut.equals(value, other) instead of native equality operators.");
      return;

    case ts.SyntaxKind.PlusToken:
      addIssue(node, "Use Shortcuts text actions instead of native + for runtime values.");
      return;

    default:
  }
}

/**
 * 判断表达式是否会产生或引用运行期值。
 */
function isRuntimeValueExpression(
  node: ts.Expression,
  isRuntimeIdentifier: (node: ts.Node) => boolean,
): boolean {
  const expression = unwrapExpression(node);

  if (isRuntimeIdentifier(expression)) {
    return true;
  }

  if (!ts.isCallExpression(expression)) {
    return false;
  }

  const callee = expression.expression;

  if (!ts.isPropertyAccessExpression(callee)) {
    return false;
  }

  if (isShortcutRuntimeCall(callee)) {
    return true;
  }

  if (isRuntimeIdentifier(callee.expression) && chainRuntimeMethods.has(callee.name.text)) {
    return true;
  }

  if (
    isRuntimeValueExpression(callee.expression, isRuntimeIdentifier) &&
    (chainRuntimeMethods.has(callee.name.text) || conditionMethods.has(callee.name.text))
  ) {
    return true;
  }

  return false;
}

/**
 * 判断调用是否来自 workflow builder 并返回运行期值。
 */
function isShortcutRuntimeCall(callee: ts.PropertyAccessExpression): boolean {
  return ts.isIdentifier(callee.expression) &&
    callee.expression.text === "shortcut" &&
    runtimeValueMethods.has(callee.name.text);
}

/**
 * 去掉不影响语义判断的表达式包装。
 */
function unwrapExpression(node: ts.Expression): ts.Expression {
  let current = node;

  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}
