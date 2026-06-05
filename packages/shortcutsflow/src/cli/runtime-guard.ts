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
  "matchText",
  "replaceText",
  "setVariable",
  "splitText",
  "text",
  "url",
]);

const chainRuntimeMethods = new Set([
  "base64Decode",
  "base64Encode",
  "get",
  "getDictionaryValue",
  "getItem",
  "match",
  "replace",
  "split",
]);

const conditionMethods = new Set([
  "equals",
  "exists",
]);

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
