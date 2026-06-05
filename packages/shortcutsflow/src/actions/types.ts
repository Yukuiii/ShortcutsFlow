import type {
  ShortcutCondition,
  ShortcutDictionary,
  ShortcutNode,
  ShortcutValue,
} from "../core/types.js";
import type { ShortcutIconInput } from "../core/icon.js";

export type ValueInput = string | number | boolean | ShortcutValue;

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type GetContentsOfURLOptions = {
  method?: HTTPMethod;
  headers?: ShortcutDictionary;
};

export type AskForInputOptions = {
  defaultAnswer?: ValueInput;
};

export type ChooseFromListOptions = {
  prompt?: ValueInput;
};

export type SplitTextSeparator = "New Lines" | "Spaces" | "Commas";

export type SplitTextOptions = {
  separator?: SplitTextSeparator;
};

export type GetItemFromListOptions =
  | {
      mode?: "first" | "last" | "random";
    }
  | {
      mode: "range";
      start: ValueInput;
    };

export type RuntimeValue<T = unknown> = ShortcutValue<T> & {
  /**
   * 替换文本。
   *
   * 添加 Replace Text 动作并返回替换后的运行期文本引用。
   */
  replace(find: ValueInput, replace: ValueInput): RuntimeValue<string>;

  /**
   * 拆分文本。
   *
   * 添加 Split Text 动作并返回拆分后的运行期列表引用。
   */
  split(separator?: SplitTextSeparator | SplitTextOptions): RuntimeValue<string[]>;

  /**
   * 匹配文本。
   *
   * 添加 Match Text 动作并返回匹配结果的运行期列表引用。
   */
  match(pattern: ValueInput): RuntimeValue<string[]>;

  /**
   * 获取词典值。
   *
   * 添加 Get Dictionary Value 动作并返回指定 key 的运行期值引用。
   */
  getDictionaryValue(key: ValueInput): RuntimeValue<unknown>;

  /**
   * 获取词典值。
   *
   * 添加 Get Dictionary Value 动作的简写方法，适合链式读取词典字段。
   */
  get(key: ValueInput): RuntimeValue<unknown>;

  /**
   * 从列表中获取项目。
   *
   * 添加 Get Item from List 动作并返回列表项目的运行期值引用。
   */
  getItem(options?: GetItemFromListOptions): RuntimeValue<unknown>;

  /**
   * Base64 编码。
   *
   * 添加 Base64 Encode 动作并返回编码后的运行期文本引用。
   */
  base64Encode(): RuntimeValue<string>;

  /**
   * Base64 解码。
   *
   * 添加 Base64 Decode 动作并返回解码后的运行期文本引用。
   */
  base64Decode(): RuntimeValue<string>;

  /**
   * 如果条件：存在。
   *
   * 创建用于 If 控制流的存在性条件对象。
   */
  exists(): ShortcutCondition;

  /**
   * 如果条件：等于。
   *
   * 创建用于 If 控制流的相等条件对象。
   */
  equals(right: unknown): ShortcutCondition;
};

export type OpenAppInput = string | {
  bundleIdentifier: string;
  name?: string;
  teamIdentifier?: string;
};

export type MenuItems = Record<string, ShortcutNode[]>;

export type WorkflowBranch = (shortcut: WorkflowBuilder) => void;

export type BuilderShortcutDefinition = {
  name: string;
  icon?: ShortcutIconInput;
  workflow: WorkflowBranch;
};

export type WorkflowBuilder = {
  /**
   * 注释。
   *
   * 添加一条 Shortcuts Comment 动作，用于在生成的快捷指令里记录说明，不会产生可供后续动作引用的输出。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   shortcut.comment("Generated from TypeScript.");
   * }
   * ```
   */
  comment(text: string): void;

  /**
   * 文本。
   *
   * 添加 Text 动作并返回该动作的输出引用，后续动作可以直接接收这个引用作为输入。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello from TypeScript");
   *   shortcut.showResult(message);
   * }
   * ```
   */
  text(value: ValueInput): RuntimeValue<string>;

  /**
   * 显示结果。
   *
   * 添加 Show Result 动作，用于在快捷指令运行时展示文本、数字、布尔值或上游 action 输出。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   shortcut.showResult("Build complete");
   * }
   * ```
   */
  showResult(input: ValueInput): void;

  /**
   * 设定变量。
   *
   * 添加 Set Variable 动作并返回该运行期命名变量引用，适合显式暴露给后续复杂分支复用。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   const messageVariable = shortcut.setVariable("Message", message);
   *   shortcut.showResult(messageVariable);
   * }
   * ```
   */
  setVariable(name: string, input?: ValueInput): RuntimeValue<string>;

  /**
   * 词典。
   *
   * 添加 Dictionary 动作并返回该字典输出引用，可用于配置对象、请求 header 或后续取值。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const config = shortcut.dictionary({
   *     env: "dev",
   *     retries: 3,
   *     enabled: true,
   *   });
   *   shortcut.showResult(config);
   * }
   * ```
   */
  dictionary(value: ShortcutDictionary): RuntimeValue<ShortcutDictionary>;

  /**
   * URL。
   *
   * 添加 URL 动作并返回 URL 输出引用，适合传给 Open URL 或 Get Contents of URL。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const website = shortcut.url("https://www.icloud.com/shortcuts");
   *   shortcut.openURL(website);
   * }
   * ```
   */
  url(value: ValueInput): RuntimeValue<string>;

  /**
   * 打开 URL。
   *
   * 添加 Open URL 动作，用于在快捷指令运行时打开 URL 字符串或 URL action 的输出。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const website = shortcut.url("https://www.apple.com");
   *   shortcut.openURL(website);
   * }
   * ```
   */
  openURL(input: ValueInput): void;

  /**
   * 显示通知。
   *
   * 添加 Show Notification 动作，用于发送系统通知，标题和正文都可以来自上游 action 输出。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Sync finished");
   *   shortcut.notification("ShortcutsFlow", message);
   * }
   * ```
   */
  notification(title: ValueInput, body?: ValueInput): void;

  /**
   * 获取词典值。
   *
   * 添加 Get Dictionary Value 动作并返回指定词典 key 的输出引用，适合从 Dictionary action 中读取配置值。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const config = shortcut.dictionary({
   *     endpoint: "https://example.com/config.json",
   *   });
   *   const endpoint = shortcut.getDictionaryValue(config, "endpoint");
   *   shortcut.showResult(endpoint);
   * }
   * ```
   */
  getDictionaryValue(input: ValueInput, key: ValueInput): RuntimeValue<unknown>;

  /**
   * 获取 URL 内容。
   *
   * 添加 Get Contents of URL 动作并返回远程响应输出引用，支持配置 HTTP method 和 headers。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const endpoint = shortcut.url("https://example.com/config.json");
   *   const response = shortcut.getContentsOfURL(endpoint, {
   *     method: "GET",
   *     headers: {
   *       Accept: "application/json",
   *     },
   *   });
   *   shortcut.showResult(response);
   * }
   * ```
   */
  getContentsOfURL(input: ValueInput, options?: GetContentsOfURLOptions): RuntimeValue<unknown>;

  /**
   * Base64 编码。
   *
   * 添加 Base64 Encode 动作并返回编码后的文本输出引用。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   const encoded = shortcut.base64Encode(message);
   *   shortcut.showResult(encoded);
   * }
   * ```
   */
  base64Encode(input: ValueInput): RuntimeValue<string>;

  /**
   * Base64 解码。
   *
   * 添加 Base64 Decode 动作并返回解码后的文本输出引用。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const encoded = shortcut.text("SGVsbG8=");
   *   const decoded = shortcut.base64Decode(encoded);
   *   shortcut.showResult(decoded);
   * }
   * ```
   */
  base64Decode(input: ValueInput): RuntimeValue<string>;

  /**
   * 询问输入。
   *
   * 添加 Ask for Input 动作并返回用户输入内容。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const cookie = shortcut.askForInput("输入 cookie", {
   *     defaultAnswer: "",
   *   });
   *   shortcut.showResult(cookie);
   * }
   * ```
   */
  askForInput(prompt: ValueInput, options?: AskForInputOptions): RuntimeValue<string>;

  /**
   * 从列表中选取。
   *
   * 添加 Choose from List 动作并返回用户选中的项目。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const selected = shortcut.chooseFromList("dev,prod", {
   *     prompt: "选择环境",
   *   });
   *   shortcut.showResult(selected);
   * }
   * ```
   */
  chooseFromList(input: ValueInput, options?: ChooseFromListOptions): RuntimeValue<unknown>;

  /**
   * 从输入中获取词典。
   *
   * 添加 Detect Dictionary 动作并返回从输入中识别出的词典。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const response = shortcut.getContentsOfURL("https://example.com/config.json");
   *   const config = shortcut.detectDictionary(response);
   *   shortcut.showResult(config);
   * }
   * ```
   */
  detectDictionary(input: ValueInput): RuntimeValue<ShortcutDictionary>;

  /**
   * 匹配文本。
   *
   * 添加 Match Text 动作并返回正则匹配结果。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const matches = shortcut.matchText("Cookie: abc", "Cookie: (.+)");
   *   shortcut.showResult(matches);
   * }
   * ```
   */
  matchText(input: ValueInput, pattern: ValueInput): RuntimeValue<string[]>;

  /**
   * 拆分文本。
   *
   * 添加 Split Text 动作并返回拆分后的文本列表。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const words = shortcut.splitText("hello world", {
   *     separator: "Spaces",
   *   });
   *   shortcut.showResult(words);
   * }
   * ```
   */
  splitText(input: ValueInput, options?: SplitTextOptions): RuntimeValue<string[]>;

  /**
   * 替换文本。
   *
   * 添加 Replace Text 动作并返回替换后的文本。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const updated = shortcut.replaceText("hello world", "world", "ShortcutsFlow");
   *   shortcut.showResult(updated);
   * }
   * ```
   */
  replaceText(input: ValueInput, find: ValueInput, replace: ValueInput): RuntimeValue<string>;

  /**
   * 从列表中获取项目。
   *
   * 添加 Get Item from List 动作并返回列表中的项目。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const item = shortcut.getItemFromList("dev,prod", {
   *     mode: "random",
   *   });
   *   shortcut.showResult(item);
   * }
   * ```
   */
  getItemFromList(input: ValueInput, options?: GetItemFromListOptions): RuntimeValue<unknown>;

  /**
   * 等待。
   *
   * 添加 Delay 动作并暂停指定秒数。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   shortcut.delay(3);
   *   shortcut.showResult("Done");
   * }
   * ```
   */
  delay(seconds: ValueInput): void;

  /**
   * 打开 App。
   *
   * 添加 Open App 动作并打开指定 bundle identifier 的 App。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   shortcut.openApp({
   *     bundleIdentifier: "com.apple.shortcuts",
   *     name: "快捷指令",
   *   });
   * }
   * ```
   */
  openApp(app: OpenAppInput): void;

  /**
   * 添加到变量。
   *
   * 添加 Append to Variable 动作并把输入追加到运行期命名变量。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const item = shortcut.text("Task");
   *   const tasks = shortcut.appendVariable("Tasks", item);
   *   shortcut.showResult(tasks);
   * }
   * ```
   */
  appendVariable(name: string, input: ValueInput): RuntimeValue<unknown>;

  /**
   * 如果条件：存在。
   *
   * 创建 exists 条件对象，用于 If 控制流判断输入是否存在或是否有值。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.exists(message), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  exists(left: unknown): ShortcutCondition;

  /**
   * 如果条件：等于。
   *
   * 创建 equals 条件对象，用于 If 控制流比较两个输入是否相等。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.equals(message, "Hello"), {
   *     then: (shortcut) => {
   *       shortcut.notification("Matched");
   *     },
   *   });
   * }
   * ```
   */
  equals(left: unknown, right: unknown): ShortcutCondition;

  /**
   * 如果。
   *
   * 添加 If 控制流，并在 then 或 otherwise 分支中继续使用同一个 builder API 声明动作。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.exists(message), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *     otherwise: (shortcut) => {
   *       shortcut.notification("No message");
   *     },
   *   });
   * }
   * ```
   */
  if(condition: ShortcutCondition, branches: {
    then: WorkflowBranch;
    otherwise?: WorkflowBranch;
  }): void;

  /**
   * 如果。
   *
   * 添加只有 then 分支的 If 控制流，是 `shortcut.if(condition, { then })` 的简写。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.when(message.exists(), (shortcut) => {
   *     shortcut.showResult(message);
   *   });
   * }
   * ```
   */
  when(condition: ShortcutCondition, then: WorkflowBranch): void;

  /**
   * 重复每一项。
   *
   * 添加 Repeat with Each 控制流，并把 body 中声明的动作放入重复体。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const config = shortcut.dictionary({
   *     first: "one",
   *     second: "two",
   *   });
   *   shortcut.repeatEach(config, (shortcut) => {
   *     shortcut.comment("Handle repeated item.");
   *   });
   * }
   * ```
   */
  repeatEach(input: ValueInput, body: WorkflowBranch): void;

  /**
   * 从菜单中选取。
   *
   * 添加 Choose from Menu 控制流，每个菜单项对应一个独立的 workflow 分支。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   shortcut.chooseFromMenu("Choose next action", {
   *     "Show Message": (shortcut) => {
   *       shortcut.showResult("Hello");
   *     },
   *     "Open Website": (shortcut) => {
   *       shortcut.openURL("https://www.apple.com");
   *     },
   *   });
   * }
   * ```
   */
  chooseFromMenu(prompt: string, items: Record<string, WorkflowBranch>): void;
};
