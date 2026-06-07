import type { ShortcutCondition, ShortcutSingleCondition, ShortcutValue } from "./types.js";

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
 * 创建一个运行期 action output 引用。
 */
export function actionOutput<T = unknown>(name: string): ShortcutValue<T> {
  return {
    kind: "action-output",
    value: name as T,
  };
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
export function exists(left: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "exists",
    left,
  };
}

/**
 * 创建 Shortcuts 无值判断条件。
 */
export function doesNotExist(left: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "doesNotExist",
    left,
  };
}

/**
 * 创建 Shortcuts 相等判断条件。
 */
export function equals(left: unknown, right: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "equals",
    left,
    right,
  };
}

/**
 * 创建 Shortcuts 不相等判断条件。
 */
export function notEquals(left: unknown, right: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "notEquals",
    left,
    right,
  };
}

/**
 * 创建 Shortcuts 包含判断条件。
 */
export function contains(left: unknown, right: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "contains",
    left,
    right,
  };
}

/**
 * 创建 Shortcuts 不包含判断条件。
 */
export function doesNotContain(left: unknown, right: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "doesNotContain",
    left,
    right,
  };
}

/**
 * 创建 Shortcuts 开头匹配判断条件。
 */
export function beginsWith(left: unknown, right: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "beginsWith",
    left,
    right,
  };
}

/**
 * 创建 Shortcuts 结尾匹配判断条件。
 */
export function endsWith(left: unknown, right: unknown): ShortcutSingleCondition {
  return {
    kind: "condition",
    operator: "endsWith",
    left,
    right,
  };
}

/**
 * 创建 Shortcuts 全部条件都满足的条件组。
 */
export function all(conditions: ShortcutSingleCondition[]): ShortcutCondition {
  return {
    kind: "condition-group",
    mode: "all",
    conditions,
  };
}

/**
 * 创建 Shortcuts 任一条件满足的条件组。
 */
export function any(conditions: ShortcutSingleCondition[]): ShortcutCondition {
  return {
    kind: "condition-group",
    mode: "any",
    conditions,
  };
}
