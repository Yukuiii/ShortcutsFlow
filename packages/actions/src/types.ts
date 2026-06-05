import type {
  ShortcutCondition,
  ShortcutDictionary,
  ShortcutIconInput,
  ShortcutNode,
  ShortcutValue,
} from "@shortcutsflow/core";

export type ValueInput = string | number | boolean | ShortcutValue;

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type GetContentsOfURLOptions = {
  method?: HTTPMethod;
  headers?: ShortcutDictionary;
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
  text(value: ValueInput): ShortcutValue<string>;

  /**
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
  setVariable(name: string, input?: ValueInput): ShortcutValue<string>;

  /**
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
  dictionary(value: ShortcutDictionary): ShortcutValue<ShortcutDictionary>;

  /**
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
  url(value: ValueInput): ShortcutValue<string>;

  /**
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
   * 添加 Get Dictionary Value 动作并返回指定 key 的输出引用，适合从 Dictionary action 中读取配置值。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const config = shortcut.dictionary({
   *     endpoint: "https://example.com/config.json",
   *   });
   *   const endpoint = shortcut.getValueForKey(config, "endpoint");
   *   shortcut.showResult(endpoint);
   * }
   * ```
   */
  getValueForKey(input: ValueInput, key: ValueInput): ShortcutValue<unknown>;

  /**
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
  getContentsOfURL(input: ValueInput, options?: GetContentsOfURLOptions): ShortcutValue<unknown>;

  /**
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
  base64Encode(input: ValueInput): ShortcutValue<string>;

  /**
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
  base64Decode(input: ValueInput): ShortcutValue<string>;

  /**
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
