import ts from "typescript";
import type { RuntimeGuardContext } from "../context.js";
import { isShortcutValueRefExpression } from "../runtime-values.js";

/**
 * 检查运行期值是否被用于原生 if。
 */
export function checkNativeIfStatement(node: ts.IfStatement, context: RuntimeGuardContext): void {
  if (isShortcutValueRefExpression(node.expression, context.isRuntimeIdentifier)) {
    context.addIssue(
      node.expression,
      "Use shortcut.if(value.exists(), ...) or shortcut.when(value.exists(), ...) instead of native if.",
    );
  }
}

/**
 * 检查运行期值是否被用于原生三元表达式。
 */
export function checkNativeConditionalExpression(
  node: ts.ConditionalExpression,
  context: RuntimeGuardContext,
): void {
  if (isShortcutValueRefExpression(node.condition, context.isRuntimeIdentifier)) {
    context.addIssue(
      node.condition,
      "Use shortcut.if/shortcut.when instead of native ternary expressions for runtime values.",
    );
  }
}

/**
 * 检查运行期值是否被用于原生二元表达式。
 */
export function checkNativeBinaryExpression(
  node: ts.BinaryExpression,
  context: RuntimeGuardContext,
): void {
  const leftIsRuntime = isShortcutValueRefExpression(node.left, context.isRuntimeIdentifier);
  const rightIsRuntime = isShortcutValueRefExpression(node.right, context.isRuntimeIdentifier);

  if (!leftIsRuntime && !rightIsRuntime) {
    return;
  }

  switch (node.operatorToken.kind) {
    case ts.SyntaxKind.AmpersandAmpersandToken:
    case ts.SyntaxKind.BarBarToken:
      context.addIssue(
        node,
        "Use shortcut.if/shortcut.when instead of native && or || for runtime values.",
      );
      return;

    case ts.SyntaxKind.EqualsEqualsToken:
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      context.addIssue(
        node,
        "Use value.equals(other) or shortcut.equals(value, other) instead of native equality operators.",
      );
      return;

    case ts.SyntaxKind.PlusToken:
      context.addIssue(
        node,
        "Use Shortcuts text actions instead of native + for runtime values.",
      );
      return;

    default:
  }
}
