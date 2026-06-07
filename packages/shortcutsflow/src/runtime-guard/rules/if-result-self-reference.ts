import ts from "typescript";
import { findIdentifierReference, unwrapExpression } from "../ast.js";
import type { RuntimeGuardContext } from "../context.js";

const ifResultSelfReferenceMessage = "Do not reference an If result inside the same shortcut.if(...) branches. The If result is only available after that If control flow ends.";

/**
 * 检查 If 返回值是否在自身分支中被引用。
 */
export function checkIfResultSelfReference(
  resultName: ts.Identifier,
  initializer: ts.Expression,
  context: RuntimeGuardContext,
): void {
  for (const branchBody of findShortcutIfBranchBodies(initializer)) {
    const reference = findIdentifierReference(branchBody, resultName.text);

    if (reference) {
      context.addIssue(reference, ifResultSelfReferenceMessage);
    }
  }
}

/**
 * 检查赋值形式的 If 返回值是否在自身分支中被引用。
 */
export function checkIfResultAssignmentSelfReference(
  node: ts.BinaryExpression,
  context: RuntimeGuardContext,
): void {
  if (node.operatorToken.kind !== ts.SyntaxKind.EqualsToken || !ts.isIdentifier(node.left)) {
    return;
  }

  checkIfResultSelfReference(node.left, node.right, context);
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
