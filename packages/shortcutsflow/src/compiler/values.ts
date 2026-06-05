import type { ShortcutValue } from "../core/types.js";
import { isShortcutValue } from "../core/value.js";
import type { PlistValue } from "../plist/index.js";
import type { CompileContext } from "./context.js";

/**
 * 编译可以作为 action 输入的值。
 */
export function compileInput(value: unknown, context: CompileContext): PlistValue {
  if (isShortcutValue(value)) {
    return compileShortcutValue(value, context);
  }

  return compileTextToken(value, context);
}

/**
 * 编译字符串或变量插值形式的文本 token。
 */
export function compileTextToken(value: unknown, context: CompileContext): PlistValue {
  if (isShortcutValue(value)) {
    return {
      Value: {
        string: "￼",
        attachmentsByRange: {
          "{0, 1}": compileAttachmentValue(value, context),
        },
      },
      WFSerializationType: "WFTextTokenString",
    };
  }

  return String(value ?? "");
}

/**
 * 编译普通参数值，并在非变量字面量时保留数字和布尔类型。
 */
export function compileParameterValue(value: unknown, context: CompileContext): PlistValue {
  if (isShortcutValue(value)) {
    return compileShortcutValue(value, context);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return compileTextToken(value, context);
}

/**
 * 编译框架内部值引用为 Shortcuts 变量 attachment。
 */
function compileShortcutValue(value: ShortcutValue, context: CompileContext): PlistValue {
  if (value.kind === "variable" || value.kind === "action-output") {
    return {
      Value: compileAttachmentValue(value, context),
      WFSerializationType: "WFTextTokenAttachment",
    };
  }

  if (value.kind === "literal") {
    return compileTextToken(value.value, context);
  }

  throw new Error(`Unsupported shortcut value kind: ${value.kind}`);
}

/**
 * 编译可嵌入文本 token 的变量 payload。
 */
function compileAttachmentValue(value: ShortcutValue, context: CompileContext): PlistValue {
  if (value.kind === "variable") {
    return {
      Type: "Variable",
      VariableName: String(value.value),
    };
  }

  if (value.kind === "action-output") {
    const outputName = String(value.value);
    const output = context.outputs.get(outputName);

    if (!output) {
      throw new Error(`Unknown action output: ${outputName}`);
    }

    return {
      Type: "ActionOutput",
      OutputName: output.outputName,
      OutputUUID: output.uuid,
    };
  }

  if (value.kind === "literal") {
    return {
      Type: "Variable",
      VariableName: String(value.value ?? ""),
    };
  }

  throw new Error(`Unsupported shortcut value kind: ${value.kind}`);
}
