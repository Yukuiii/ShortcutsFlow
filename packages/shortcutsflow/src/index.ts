import { ref as createRef } from "./core/value.js";
import type { ShortcutReference } from "./actions/types.js";

export { defineShortcut } from "./actions/builder.js";
export { icon } from "./core/icon.js";

/**
 * 创建一个运行期命名变量引用。
 */
export function ref(name: string): ShortcutReference<string> {
  return createRef(name) as unknown as ShortcutReference<string>;
}

export type {
  AskForInputOptions,
  AskForInputInputType,
  AskForInputNumberOptions,
  AskForInputTextOptions,
  AskForInputTypedOptions,
  BuilderShortcutDefinition,
  ChooseFromListOptions,
  GetContentsOfURLOptions,
  GetItemFromListOptions,
  HTTPMethod,
  OpenAppInput,
  ShortcutReference,
  ShortcutValueRef,
  ShortcutVariableRef,
  ShowAlertOptions,
  SplitTextOptions,
  SplitTextSeparator,
  ValueInput,
  WorkflowBranch,
  WorkflowBuilder,
} from "./actions/types.js";
export type {
  ShortcutCondition,
  ShortcutConditionGroup,
  ShortcutConditionGroupMode,
  ShortcutConditionOperator,
  ShortcutDictionary,
  ShortcutDictionaryValue,
  ShortcutIcon,
  ShortcutSingleCondition,
} from "./core/types.js";
export type {
  ShortcutIconColor,
  ShortcutIconColorInput,
  ShortcutIconColorName,
  ShortcutIconGlyph,
  ShortcutIconGlyphInput,
  ShortcutIconGlyphName,
  ShortcutIconInput,
} from "./core/icon.js";
