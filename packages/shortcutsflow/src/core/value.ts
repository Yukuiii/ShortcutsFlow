import type { ShortcutCondition, ShortcutValue } from "./types.js";

/**
 * 创建一个构建期字面量值。
 */
export function literal<T>(value: T): ShortcutValue<T> {
  return {
    kind: "literal",
    value,
  };
}

/**
 * 创建一个运行期变量引用。
 */
export function variable(name: string): ShortcutValue<string> {
  return {
    kind: "variable",
    value: name,
  };
}

/**
 * 创建一个运行期变量引用的简写形式。
 */
export function ref(name: string): ShortcutValue<string> {
  return variable(name);
}

/**
 * 判断一个值是否为框架内部的 ShortcutValue。
 */
export function isShortcutValue(value: unknown): value is ShortcutValue {
  return (
    typeof value === "object" &&
    value !== null &&
    "kind" in value &&
    "value" in value
  );
}

/**
 * 创建 Shortcuts 存在性判断条件。
 */
export function exists(left: unknown): ShortcutCondition {
  return {
    kind: "condition",
    operator: "exists",
    left,
  };
}

/**
 * 创建 Shortcuts 相等判断条件。
 */
export function equals(left: unknown, right: unknown): ShortcutCondition {
  return {
    kind: "condition",
    operator: "equals",
    left,
    right,
  };
}
