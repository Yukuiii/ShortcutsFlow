import type {
  ShortcutActionNode,
  ShortcutCondition,
  ShortcutDictionary,
  ShortcutMenuNode,
  ShortcutNode,
  ShortcutRepeatEachNode,
} from "@shortcutsflow/core";
import type {
  AskForInputOptions,
  ChooseFromListOptions,
  GetContentsOfURLOptions,
  GetItemFromListOptions,
  MenuItems,
  OpenAppInput,
  SplitTextOptions,
  ValueInput,
} from "./types.js";

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
 * import { getDictionaryValue } from "@shortcutsflow/actions";
 * import { variable } from "@shortcutsflow/core";
 *
 * const node = getDictionaryValue(variable("Config"), "endpoint");
 * ```
 */
export function getDictionaryValue(input: ValueInput, key: ValueInput): ShortcutActionNode {
  return action("getDictionaryValue", {
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
 * 创建 Shortcuts Ask for Input 动作节点，适合直接构造 AST 时请求用户输入文本。
 *
 * @example
 * ```ts
 * import { askForInput } from "@shortcutsflow/actions";
 *
 * const node = askForInput("输入 cookie", {
 *   defaultAnswer: "",
 * });
 * ```
 */
export function askForInput(
  prompt: ValueInput,
  options: AskForInputOptions = {},
): ShortcutActionNode {
  return action("askForInput", {
    prompt,
    options,
  });
}

/**
 * 创建 Shortcuts Choose from List 动作节点，适合直接构造 AST 时让用户从输入列表中选择一项。
 *
 * @example
 * ```ts
 * import { chooseFromList } from "@shortcutsflow/actions";
 * import { variable } from "@shortcutsflow/core";
 *
 * const node = chooseFromList(variable("Items"), {
 *   prompt: "选择环境",
 * });
 * ```
 */
export function chooseFromList(
  input: ValueInput,
  options: ChooseFromListOptions = {},
): ShortcutActionNode {
  return action("chooseFromList", {
    input,
    options,
  });
}

/**
 * 创建 Shortcuts Detect Dictionary 动作节点，适合直接构造 AST 时把 JSON 或字典内容识别成词典。
 *
 * @example
 * ```ts
 * import { detectDictionary } from "@shortcutsflow/actions";
 * import { variable } from "@shortcutsflow/core";
 *
 * const node = detectDictionary(variable("Response"));
 * ```
 */
export function detectDictionary(input: ValueInput): ShortcutActionNode {
  return action("detectDictionary", {
    input,
  });
}

/**
 * 创建 Shortcuts Match Text 动作节点，适合直接构造 AST 时用正则表达式提取匹配结果。
 *
 * @example
 * ```ts
 * import { matchText } from "@shortcutsflow/actions";
 *
 * const node = matchText("Cookie: abc", "Cookie: (.+)");
 * ```
 */
export function matchText(input: ValueInput, pattern: ValueInput): ShortcutActionNode {
  return action("matchText", {
    input,
    pattern,
  });
}

/**
 * 创建 Shortcuts Split Text 动作节点，适合直接构造 AST 时把文本拆成列表。
 *
 * @example
 * ```ts
 * import { splitText } from "@shortcutsflow/actions";
 *
 * const node = splitText("hello world", {
 *   separator: "Spaces",
 * });
 * ```
 */
export function splitText(
  input: ValueInput,
  options: SplitTextOptions = {},
): ShortcutActionNode {
  return action("splitText", {
    input,
    options,
  });
}

/**
 * 创建 Shortcuts Replace Text 动作节点，适合直接构造 AST 时替换文本内容。
 *
 * @example
 * ```ts
 * import { replaceText } from "@shortcutsflow/actions";
 *
 * const node = replaceText("hello world", "world", "ShortcutsFlow");
 * ```
 */
export function replaceText(
  input: ValueInput,
  find: ValueInput,
  replace: ValueInput,
): ShortcutActionNode {
  return action("replaceText", {
    input,
    find,
    replace,
  });
}

/**
 * 创建 Shortcuts Get Item from List 动作节点，适合直接构造 AST 时从列表中取指定项目。
 *
 * @example
 * ```ts
 * import { getItemFromList } from "@shortcutsflow/actions";
 * import { variable } from "@shortcutsflow/core";
 *
 * const node = getItemFromList(variable("Items"), {
 *   mode: "random",
 * });
 * ```
 */
export function getItemFromList(
  input: ValueInput,
  options: GetItemFromListOptions = {},
): ShortcutActionNode {
  return action("getItemFromList", {
    input,
    options,
  });
}

/**
 * 创建 Shortcuts Delay 动作节点，适合直接构造 AST 时暂停指定秒数。
 *
 * @example
 * ```ts
 * import { delay } from "@shortcutsflow/actions";
 *
 * const node = delay(3);
 * ```
 */
export function delay(seconds: ValueInput): ShortcutActionNode {
  return action("delay", {
    seconds,
  });
}

/**
 * 创建 Shortcuts Open App 动作节点，适合直接构造 AST 时打开指定 App。
 *
 * @example
 * ```ts
 * import { openApp } from "@shortcutsflow/actions";
 *
 * const node = openApp({
 *   bundleIdentifier: "com.apple.shortcuts",
 *   name: "快捷指令",
 * });
 * ```
 */
export function openApp(app: OpenAppInput): ShortcutActionNode {
  return action("openApp", {
    app,
  });
}

/**
 * 创建 Shortcuts Add to Variable 动作节点，适合直接构造 AST 时把输入追加到运行期命名变量。
 *
 * @example
 * ```ts
 * import { appendVariable } from "@shortcutsflow/actions";
 *
 * const node = appendVariable("Tasks", "Task");
 * ```
 */
export function appendVariable(name: string, input: ValueInput): ShortcutActionNode {
  return action("appendVariable", {
    name,
    input,
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
