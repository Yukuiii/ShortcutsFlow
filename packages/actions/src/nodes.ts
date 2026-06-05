import type {
  ShortcutActionNode,
  ShortcutCondition,
  ShortcutDictionary,
  ShortcutMenuNode,
  ShortcutNode,
  ShortcutRepeatEachNode,
} from "@shortcutsflow/core";
import type { GetContentsOfURLOptions, MenuItems, ValueInput } from "./types.js";

/**
 * 创建底层 action 节点。
 */
function action(actionName: string, params: Record<string, unknown> = {}): ShortcutActionNode {
  return {
    kind: "action",
    action: actionName,
    params,
  };
}

/**
 * 创建 Shortcuts Comment 动作节点，适合直接构造 AST 时插入不会影响运行数据流的说明。
 *
 * @example
 * ```ts
 * import { comment } from "@shortcutsflow/actions";
 *
 * const node = comment("Generated from TypeScript.");
 * ```
 */
export function comment(text: string): ShortcutActionNode {
  return action("comment", {
    text,
  });
}

/**
 * 创建 Shortcuts Text 动作节点，适合直接构造 AST 时声明一段文本输入。
 *
 * @example
 * ```ts
 * import { text } from "@shortcutsflow/actions";
 *
 * const node = text("Hello from TypeScript");
 * ```
 */
export function text(value: ValueInput): ShortcutActionNode {
  return action("text", {
    value,
  });
}

/**
 * 创建 Shortcuts Show Result 动作节点，适合直接构造 AST 时展示一个字面量或变量引用。
 *
 * @example
 * ```ts
 * import { showResult } from "@shortcutsflow/actions";
 *
 * const node = showResult("Build complete");
 * ```
 */
export function showResult(input: ValueInput): ShortcutActionNode {
  return action("showResult", {
    input,
  });
}

/**
 * 创建 Shortcuts Set Variable 动作节点，适合直接构造 AST 时把输入写入运行期命名变量。
 *
 * @example
 * ```ts
 * import { setVariable } from "@shortcutsflow/actions";
 *
 * const node = setVariable("Message", "Hello");
 * ```
 */
export function setVariable(name: string, input?: ValueInput): ShortcutActionNode {
  return action("setVariable", {
    name,
    input,
  });
}

/**
 * 创建 Shortcuts Dictionary 动作节点，适合直接构造 AST 时声明结构化键值数据。
 *
 * @example
 * ```ts
 * import { dictionary } from "@shortcutsflow/actions";
 *
 * const node = dictionary({
 *   env: "dev",
 *   retries: 3,
 *   enabled: true,
 * });
 * ```
 */
export function dictionary(value: ShortcutDictionary): ShortcutActionNode {
  return action("dictionary", {
    value,
  });
}

/**
 * 创建 Shortcuts URL 动作节点，适合直接构造 AST 时声明 URL 输入。
 *
 * @example
 * ```ts
 * import { url } from "@shortcutsflow/actions";
 *
 * const node = url("https://www.icloud.com/shortcuts");
 * ```
 */
export function url(value: ValueInput): ShortcutActionNode {
  return action("url", {
    value,
  });
}

/**
 * 创建 Shortcuts Open URL 动作节点，适合直接构造 AST 时打开 URL 字符串或 URL 变量引用。
 *
 * @example
 * ```ts
 * import { openURL } from "@shortcutsflow/actions";
 *
 * const node = openURL("https://www.apple.com");
 * ```
 */
export function openURL(input: ValueInput): ShortcutActionNode {
  return action("openURL", {
    input,
  });
}

/**
 * 创建 Shortcuts Show Notification 动作节点，适合直接构造 AST 时发送系统通知。
 *
 * @example
 * ```ts
 * import { notification } from "@shortcutsflow/actions";
 *
 * const node = notification("ShortcutsFlow", "Build complete");
 * ```
 */
export function notification(title: ValueInput, body?: ValueInput): ShortcutActionNode {
  return action("notification", {
    title,
    body,
  });
}

/**
 * 创建 Shortcuts Get Dictionary Value 动作节点，适合直接构造 AST 时从字典输入中读取指定 key。
 *
 * @example
 * ```ts
 * import { getValueForKey } from "@shortcutsflow/actions";
 * import { variable } from "@shortcutsflow/core";
 *
 * const node = getValueForKey(variable("Config"), "endpoint");
 * ```
 */
export function getValueForKey(input: ValueInput, key: ValueInput): ShortcutActionNode {
  return action("getValueForKey", {
    input,
    key,
  });
}

/**
 * 创建 Shortcuts Get Contents of URL 动作节点，适合直接构造 AST 时发起 HTTP 请求。
 *
 * @example
 * ```ts
 * import { getContentsOfURL } from "@shortcutsflow/actions";
 *
 * const node = getContentsOfURL("https://example.com/config.json", {
 *   method: "GET",
 *   headers: {
 *     Accept: "application/json",
 *   },
 * });
 * ```
 */
export function getContentsOfURL(
  input: ValueInput,
  options: GetContentsOfURLOptions = {},
): ShortcutActionNode {
  return action("getContentsOfURL", {
    input,
    options,
  });
}

/**
 * 创建 Shortcuts Base64 Encode 动作节点，适合直接构造 AST 时把输入编码为 Base64 文本。
 *
 * @example
 * ```ts
 * import { base64Encode } from "@shortcutsflow/actions";
 *
 * const node = base64Encode("Hello");
 * ```
 */
export function base64Encode(input: ValueInput): ShortcutActionNode {
  return action("base64", {
    input,
    mode: "Encode",
  });
}

/**
 * 创建 Shortcuts Base64 Decode 动作节点，适合直接构造 AST 时把 Base64 文本解码为普通文本。
 *
 * @example
 * ```ts
 * import { base64Decode } from "@shortcutsflow/actions";
 *
 * const node = base64Decode("SGVsbG8=");
 * ```
 */
export function base64Decode(input: ValueInput): ShortcutActionNode {
  return action("base64", {
    input,
    mode: "Decode",
  });
}

/**
 * 创建 Shortcuts If 控制流节点，适合直接构造 AST 时显式传入 then 和 otherwise 节点列表。
 *
 * @example
 * ```ts
 * import { if_, showResult } from "@shortcutsflow/actions";
 * import { exists, variable } from "@shortcutsflow/core";
 *
 * const node = if_(exists(variable("Message")), {
 *   then: [showResult(variable("Message"))],
 *   otherwise: [showResult("No message")],
 * });
 * ```
 */
export function if_(
  condition: ShortcutCondition,
  branches: {
    then: ShortcutNode[];
    otherwise?: ShortcutNode[];
  },
): ShortcutNode {
  return {
    kind: "if",
    condition,
    then: branches.then,
    otherwise: branches.otherwise,
  };
}

/**
 * 创建 Shortcuts Repeat with Each 控制流节点，适合直接构造 AST 时对输入集合执行一组动作。
 *
 * @example
 * ```ts
 * import { repeatEach, showResult } from "@shortcutsflow/actions";
 * import { variable } from "@shortcutsflow/core";
 *
 * const node = repeatEach(variable("Items"), [
 *   showResult(variable("Repeat Item")),
 * ]);
 * ```
 */
export function repeatEach(input: ValueInput, body: ShortcutNode[]): ShortcutRepeatEachNode {
  return {
    kind: "repeatEach",
    input,
    body,
  };
}

/**
 * 创建 Shortcuts Choose from Menu 控制流节点，适合直接构造 AST 时声明菜单项和对应动作列表。
 *
 * @example
 * ```ts
 * import { chooseFromMenu, openURL, showResult } from "@shortcutsflow/actions";
 *
 * const node = chooseFromMenu("Choose next action", {
 *   "Show Message": [showResult("Hello")],
 *   "Open Website": [openURL("https://www.apple.com")],
 * });
 * ```
 */
export function chooseFromMenu(prompt: string, items: MenuItems): ShortcutMenuNode {
  return {
    kind: "menu",
    prompt,
    items: Object.entries(items).map(([title, body]) => ({
      title,
      body,
    })),
  };
}
