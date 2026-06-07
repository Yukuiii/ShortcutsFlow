import { readFileSync } from "node:fs";
import ts from "typescript";
import { isFunctionLikeWithBody } from "./ast.js";
import { createRuntimeGuardContext } from "./context.js";
import {
  checkIfResultAssignmentSelfReference,
  checkIfResultSelfReference,
} from "./rules/if-result-self-reference.js";
import {
  checkNativeBinaryExpression,
  checkNativeConditionalExpression,
  checkNativeIfStatement,
} from "./rules/native-syntax.js";
import { isShortcutValueRefExpression } from "./runtime-values.js";
import type { RuntimeGuardContext, RuntimeGuardIssue } from "./context.js";

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
 * 单次遍历源码 AST，并把具体检查分发给独立规则。
 */
function collectRuntimeGuardIssues(sourceFile: ts.SourceFile): RuntimeGuardIssue[] {
  const context = createRuntimeGuardContext(sourceFile);

  const visit = (node: ts.Node): void => {
    if (isFunctionLikeWithBody(node)) {
      context.pushScope();
      addRepeatEachRuntimeParameters(node, context);
      ts.forEachChild(node, visit);
      context.popScope();
      return;
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      checkIfResultSelfReference(node.name, node.initializer, context);

      if (isShortcutValueRefExpression(node.initializer, context.isRuntimeIdentifier)) {
        context.currentScope().add(node.name.text);
      }
    }

    if (ts.isIfStatement(node)) {
      checkNativeIfStatement(node, context);
    }

    if (ts.isConditionalExpression(node)) {
      checkNativeConditionalExpression(node, context);
    }

    if (ts.isBinaryExpression(node)) {
      checkIfResultAssignmentSelfReference(node, context);
      checkNativeBinaryExpression(node, context);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return context.issues;
}

/**
 * repeatEach 的第二个回调参数是 Shortcuts 运行期 Repeat Item 引用。
 */
function addRepeatEachRuntimeParameters(node: ts.Node, context: RuntimeGuardContext): void {
  if (!isRepeatEachBody(node)) {
    return;
  }

  const itemParameter = node.parameters[1];

  if (itemParameter && ts.isIdentifier(itemParameter.name)) {
    context.currentScope().add(itemParameter.name.text);
  }
}

/**
 * 判断函数节点是否是 shortcut.repeatEach(input, body) 的 body 参数。
 */
function isRepeatEachBody(node: ts.Node): node is ts.FunctionLikeDeclaration & {
  parameters: ts.NodeArray<ts.ParameterDeclaration>;
} {
  const parent = node.parent;

  if (!ts.isCallExpression(parent) || parent.arguments[1] !== node) {
    return false;
  }

  const callee = parent.expression;

  return ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === "shortcut" &&
    callee.name.text === "repeatEach";
}
