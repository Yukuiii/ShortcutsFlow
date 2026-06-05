import { strict as assert } from "node:assert";
import { compileShortcut } from "@shortcutsflow/compiler";
import type { WorkflowAction } from "@shortcutsflow/compiler";
import type { ShortcutDefinition } from "@shortcutsflow/core";

export type CompiledAction = WorkflowAction;

/**
 * 编译 builder 定义并返回 Shortcuts action 列表。
 */
export function compileActions(definition: ShortcutDefinition): CompiledAction[] {
  return compileShortcut(definition).plist.WFWorkflowActions;
}

/**
 * 获取指定 identifier 的所有 action。
 */
export function actionsWithIdentifier(
  actions: CompiledAction[],
  identifier: string,
): CompiledAction[] {
  return actions.filter((action) => action.WFWorkflowActionIdentifier === identifier);
}

/**
 * 获取指定 identifier 的唯一 action。
 */
export function onlyAction(actions: CompiledAction[], identifier: string): CompiledAction {
  const matches = actionsWithIdentifier(actions, identifier);

  assert.equal(matches.length, 1, `${identifier} should appear once`);
  return matches[0] as CompiledAction;
}

/**
 * 读取 action 参数对象。
 */
export function params(action: CompiledAction): Record<string, unknown> {
  return action.WFWorkflowActionParameters as Record<string, unknown>;
}

/**
 * 断言 action 拥有指定 identifier 并返回参数。
 */
export function paramsFor(
  actions: CompiledAction[],
  identifier: string,
): Record<string, unknown> {
  return params(onlyAction(actions, identifier));
}

/**
 * 断言值是普通对象并返回该对象。
 */
export function asRecord(value: unknown, message: string): Record<string, unknown> {
  assert.equal(typeof value, "object", message);
  assert.notEqual(value, null, message);
  assert.equal(Array.isArray(value), false, message);
  return value as Record<string, unknown>;
}

/**
 * 断言值是数组并返回该数组。
 */
export function asArray<T = unknown>(value: unknown, message: string): T[] {
  assert.equal(Array.isArray(value), true, message);
  return value as T[];
}

/**
 * 断言参数是 action output attachment。
 */
export function assertActionOutputAttachment(value: unknown, outputName: string): void {
  const token = asRecord(value, `${outputName} token should be an object`);
  const tokenValue = asRecord(token.Value, `${outputName} token value should be an object`);

  assert.equal(token.WFSerializationType, "WFTextTokenAttachment");
  assert.equal(tokenValue.Type, "ActionOutput");
  assert.equal(tokenValue.OutputName, outputName);
  assert.equal(typeof tokenValue.OutputUUID, "string");
}

/**
 * 断言参数是文本 token 中嵌入的 action output attachment。
 */
export function assertTextTokenActionOutput(value: unknown, outputName: string): void {
  const token = asRecord(value, `${outputName} text token should be an object`);
  const tokenValue = asRecord(token.Value, `${outputName} text token value should be an object`);
  const attachments = asRecord(
    tokenValue.attachmentsByRange,
    `${outputName} text token attachments should be an object`,
  );
  const attachment = asRecord(
    attachments["{0, 1}"],
    `${outputName} text token attachment should be an object`,
  );

  assert.equal(token.WFSerializationType, "WFTextTokenString");
  assert.equal(tokenValue.string, "￼");
  assert.equal(attachment.Type, "ActionOutput");
  assert.equal(attachment.OutputName, outputName);
  assert.equal(typeof attachment.OutputUUID, "string");
}

/**
 * 断言参数是命名变量 attachment。
 */
export function assertVariableAttachment(value: unknown, variableName: string): void {
  const token = asRecord(value, `${variableName} token should be an object`);
  const tokenValue = asRecord(token.Value, `${variableName} token value should be an object`);

  assert.equal(token.WFSerializationType, "WFTextTokenAttachment");
  assert.equal(tokenValue.Type, "Variable");
  assert.equal(tokenValue.VariableName, variableName);
}

/**
 * 断言参数是文本 token 中嵌入的命名变量 attachment。
 */
export function assertTextTokenVariable(value: unknown, variableName: string): void {
  const token = asRecord(value, `${variableName} text token should be an object`);
  const tokenValue = asRecord(token.Value, `${variableName} text token value should be an object`);
  const attachments = asRecord(
    tokenValue.attachmentsByRange,
    `${variableName} text token attachments should be an object`,
  );
  const attachment = asRecord(
    attachments["{0, 1}"],
    `${variableName} text token attachment should be an object`,
  );

  assert.equal(token.WFSerializationType, "WFTextTokenString");
  assert.equal(tokenValue.string, "￼");
  assert.equal(attachment.Type, "Variable");
  assert.equal(attachment.VariableName, variableName);
}

/**
 * 断言 action 参数包含 UUID。
 */
export function assertUuid(parameters: Record<string, unknown>): void {
  assert.equal(typeof parameters.UUID, "string");
}
