import ts from "typescript";
import { unwrapExpression } from "./ast.js";

const shortcutValueRefMethods = new Set([
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

/**
 * 判断表达式是否会产生或引用运行期值。
 */
export function isShortcutValueRefExpression(
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
    isShortcutValueRefExpression(callee.expression, isRuntimeIdentifier) &&
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
    shortcutValueRefMethods.has(callee.name.text);
}
