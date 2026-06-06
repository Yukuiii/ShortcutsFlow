import type {
  ShortcutCondition,
  ShortcutDictionary,
  ShortcutNode,
  ShortcutSingleCondition,
} from "../core/types.js";
import type { ShortcutIconInput } from "../core/icon.js";

declare const shortcutReferenceBrand: unique symbol;

declare const shortcutValueRefBrand: unique symbol;

export type ValueInput = string | number | boolean | ShortcutReference | ShortcutValueRef;

export type ShortcutReference<T = unknown> = {
  readonly [shortcutReferenceBrand]: T;
};

export type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type GetContentsOfURLOptions = {
  /**
   * 设置 HTTP 请求方法。
   */
  method?: HTTPMethod;

  /**
   * 设置 HTTP 请求头词典。
   */
  headers?: ShortcutDictionary;
};

export type AskForInputInputType = "Text" | "Number" | "URL" | "Date" | "Date and Time" | "Time";

export type AskForInputTextOptions = {
  /**
   * 使用文本输入类型；省略时默认按文本输入编译。
   */
  inputType?: "Text";

  /**
   * 设置请求输入的默认回答。
   */
  defaultAnswer?: ValueInput;

  /**
   * 控制文本输入是否允许多行。
   */
  allowMultipleLines?: boolean;
};

export type AskForInputNumberOptions = {
  /**
   * 使用数字输入类型。
   */
  inputType: "Number";

  /**
   * 设置请求输入的默认回答。
   */
  defaultAnswer?: ValueInput;

  /**
   * 控制数字输入是否允许小数。
   */
  allowDecimal?: boolean;

  /**
   * 控制数字输入是否允许负数。
   */
  allowNegative?: boolean;
};

export type AskForInputTypedOptions = {
  /**
   * 使用 URL、日期、日期时间或时间输入类型。
   */
  inputType: Exclude<AskForInputInputType, "Text" | "Number">;

  /**
   * 设置请求输入的默认回答。
   */
  defaultAnswer?: ValueInput;
};

export type AskForInputOptions =
  | AskForInputTextOptions
  | AskForInputNumberOptions
  | AskForInputTypedOptions;

export type ChooseFromListOptions = {
  /**
   * 设置列表选择提示文本。
   */
  prompt?: ValueInput;
};

export type ShowAlertOptions = {
  /**
   * 控制显示提醒是否展示取消按钮。
   */
  showCancelButton?: boolean;
};

export type SplitTextSeparator = "New Lines" | "Spaces" | "Commas";

export type SplitTextOptions = {
  /**
   * 设置拆分文本使用的分隔符。
   */
  separator?: SplitTextSeparator;
};

export type GetItemFromListOptions =
  | {
      /**
       * 设置从列表取项目的模式。
       */
      mode?: "first" | "last" | "random";
    }
  | {
      /**
       * 使用范围模式从列表取项目。
       */
      mode: "range";

      /**
       * 设置范围模式的起始位置。
       */
      start: ValueInput;
    };

/**
 * Shortcuts 运行期值引用。
 *
 * 泛型 T 只表示 ShortcutsFlow 在构建期推断出的期望值形状，
 * 不代表 Shortcuts 运行时存在严格类型保证。
 */
export type ShortcutValueRef<T = unknown> = {
  readonly [shortcutValueRefBrand]: T;

  /**
   * 替换文本。
   *
   * 添加 Replace Text 动作并返回替换后的运行期文本引用。
   */
  replace(find: ValueInput, replace: ValueInput): ShortcutValueRef<string>;

  /**
   * 拆分文本。
   *
   * 添加 Split Text 动作并返回拆分后的运行期列表引用。
   */
  split(separator?: SplitTextSeparator | SplitTextOptions): ShortcutValueRef<string[]>;

  /**
   * 匹配文本。
   *
   * 添加 Match Text 动作并返回匹配结果的运行期列表引用。
   */
  match(pattern: ValueInput): ShortcutValueRef<string[]>;

  /**
   * 获取词典值。
   *
   * 添加 Get Dictionary Value 动作并返回指定 key 的运行期值引用。
   */
  getDictionaryValue<TKey extends ValueInput>(
    key: TKey,
  ): ShortcutValueRef<DictionaryValueFor<ShortcutValueRef<T>, TKey>>;

  /**
   * 获取词典值。
   *
   * 添加 Get Dictionary Value 动作的简写方法，适合链式读取词典字段。
   */
  get<TKey extends ValueInput>(key: TKey): ShortcutValueRef<DictionaryValueFor<ShortcutValueRef<T>, TKey>>;

  /**
   * 从列表中获取项目。
   *
   * 添加 Get Item from List 动作并返回列表项目的运行期值引用。
   */
  getItem(options?: GetItemFromListOptions): ShortcutValueRef<ListItem<T>>;

  /**
   * Base64 编码。
   *
   * 添加 Base64 Encode 动作并返回编码后的运行期文本引用。
   */
  base64Encode(): ShortcutValueRef<string>;

  /**
   * Base64 解码。
   *
   * 添加 Base64 Decode 动作并返回解码后的运行期文本引用。
   */
  base64Decode(): ShortcutValueRef<string>;

  /**
   * 如果条件：存在。
   *
   * 创建用于 If 控制流的存在性条件对象。
   */
  exists(): ShortcutSingleCondition;

  /**
   * 如果条件：等于。
   *
   * 创建用于 If 控制流的相等条件对象。
   */
  equals(right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：不等于。
   *
   * 创建用于 If 控制流的不相等条件对象。
   */
  notEquals(right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：没有值。
   *
   * 创建用于 If 控制流的无值条件对象。
   */
  doesNotExist(): ShortcutSingleCondition;

  /**
   * 如果条件：包含。
   *
   * 创建用于 If 控制流的包含条件对象。
   */
  contains(right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：不包含。
   *
   * 创建用于 If 控制流的不包含条件对象。
   */
  doesNotContain(right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：开头是。
   *
   * 创建用于 If 控制流的开头匹配条件对象。
   */
  beginsWith(right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：结尾是。
   *
   * 创建用于 If 控制流的结尾匹配条件对象。
   */
  endsWith(right: unknown): ShortcutSingleCondition;
};

export type ShortcutVariableRef<T = unknown> = ShortcutValueRef<T> & {
  /**
   * 设置变量。
   *
   * 添加 Set Variable 动作并把输入覆盖写入当前运行期命名变量。
   */
  set<TInput extends ValueInput | undefined = undefined>(
    input?: TInput,
  ): ShortcutVariableRef<ValueInputValue<TInput>>;

  /**
   * 追加到变量。
   *
   * 添加 Append to Variable 动作并把输入追加到当前运行期命名变量。
   */
  append(input: ValueInput): ShortcutVariableRef<unknown>;
};

type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;

type ValueInputKey<TInput> = TInput extends ShortcutValueRef<infer Value>
  ? Value
  : TInput extends ShortcutReference
    ? unknown
    : TInput;

type DictionaryValue<TDictionary, TKey> = TDictionary extends readonly unknown[]
  ? unknown
  : TDictionary extends Record<string, unknown>
    ? TKey extends keyof TDictionary
      ? TDictionary[TKey]
      : unknown
    : unknown;

type ListItem<T> = T extends readonly (infer Item)[] ? Item : unknown;

/**
 * 提取 ValueInput 对应的运行期值类型。
 */
export type ValueInputValue<TInput> = WidenLiteral<
  TInput extends ShortcutValueRef<infer Value>
    ? Value
    : TInput extends ShortcutReference
      ? unknown
      : TInput extends undefined
        ? unknown
        : TInput
>;

/**
 * 提取列表输入经过列表取项后的元素类型。
 */
export type ValueInputListItem<TInput> = ListItem<ValueInputValue<TInput>>;

/**
 * 根据词典输入和 key 输入推导词典取值的输出类型。
 */
export type DictionaryValueFor<TDictionaryInput, TKeyInput> = DictionaryValue<
  ValueInputValue<TDictionaryInput>,
  ValueInputKey<TKeyInput>
>;

type ShortcutValueRefInternalKey = "kind" | "value" | "valueType";

type AssertNoShortcutValueRefInternalKeys<T extends never> = T;

type ShortcutValueRefInternalKeyCheck = AssertNoShortcutValueRefInternalKeys<
  Extract<keyof ShortcutValueRef, ShortcutValueRefInternalKey>
>;

type ShortcutReferenceInternalKeyCheck = AssertNoShortcutValueRefInternalKeys<
  Extract<keyof ShortcutReference, ShortcutValueRefInternalKey>
>;

type ShortcutVariableRefInternalKeyCheck = AssertNoShortcutValueRefInternalKeys<
  Extract<keyof ShortcutVariableRef, ShortcutValueRefInternalKey>
>;

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
   * 添加一条 Shortcuts Comment 动作，用于在生成的快捷指令里记录说明，内容可以引用上游 action 输出。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   shortcut.comment("Generated from TypeScript.");
   * }
   * ```
   */
  comment(text: ValueInput): void;

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
  text(value: ValueInput): ShortcutValueRef<string>;

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
   * 显示提醒。
   *
   * 添加 Show Alert 动作，用于在快捷指令运行时弹出标题、内容和可选取消按钮。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Build complete");
   *   shortcut.showAlert("ShortcutsFlow", message, {
   *     showCancelButton: false,
   *   });
   * }
   * ```
   */
  showAlert(title: ValueInput, message: ValueInput, options?: ShowAlertOptions): void;

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
  setVariable<TInput extends ValueInput | undefined = undefined>(
    name: string,
    input?: TInput,
  ): ShortcutVariableRef<ValueInputValue<TInput>>;

  /**
   * 变量。
   *
   * 添加 Set Variable 动作初始化运行期命名变量，并返回可继续 set 或 append 的变量引用。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.variable("Message", "Hello");
   *   message.append(" World");
   *   shortcut.showResult(message);
   * }
   * ```
   */
  variable<TInput extends ValueInput | undefined = undefined>(
    name: string,
    input?: TInput,
  ): ShortcutVariableRef<ValueInputValue<TInput>>;

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
  dictionary<TValue extends ShortcutDictionary>(value: TValue): ShortcutValueRef<TValue>;

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
  url(value: ValueInput): ShortcutValueRef<string>;

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
  getDictionaryValue<TInput extends ValueInput, TKey extends ValueInput>(
    input: TInput,
    key: TKey,
  ): ShortcutValueRef<DictionaryValueFor<TInput, TKey>>;

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
  getContentsOfURL(input: ValueInput, options?: GetContentsOfURLOptions): ShortcutValueRef<unknown>;

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
  base64Encode(input: ValueInput): ShortcutValueRef<string>;

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
  base64Decode(input: ValueInput): ShortcutValueRef<string>;

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
   *     allowMultipleLines: false,
   *   });
   *   shortcut.showResult(cookie);
   * }
   * ```
   */
  askForInput(prompt: ValueInput, options?: AskForInputOptions): ShortcutValueRef<string>;
  askForInput(options?: AskForInputOptions): ShortcutValueRef<string>;

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
  chooseFromList<TInput extends ValueInput>(
    input: TInput,
    options?: ChooseFromListOptions,
  ): ShortcutValueRef<ValueInputListItem<TInput>>;

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
  detectDictionary(input: ValueInput): ShortcutValueRef<ShortcutDictionary>;

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
  matchText(input: ValueInput, pattern: ValueInput): ShortcutValueRef<string[]>;

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
  splitText(input: ValueInput, options?: SplitTextOptions): ShortcutValueRef<string[]>;

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
  replaceText(input: ValueInput, find: ValueInput, replace: ValueInput): ShortcutValueRef<string>;

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
  getItemFromList<TInput extends ValueInput>(
    input: TInput,
    options?: GetItemFromListOptions,
  ): ShortcutValueRef<ValueInputListItem<TInput>>;

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
  appendVariable(name: string, input: ValueInput): ShortcutVariableRef<unknown>;

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
  exists(left: unknown): ShortcutSingleCondition;

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
  equals(left: unknown, right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：不等于。
   *
   * 创建 notEquals 条件对象，用于 If 控制流比较两个输入是否不相等。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.notEquals(message, "World"), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  notEquals(left: unknown, right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：没有值。
   *
   * 创建 doesNotExist 条件对象，用于 If 控制流判断输入是否没有值。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.askForInput("输入文本");
   *   shortcut.if(shortcut.doesNotExist(message), {
   *     then: (shortcut) => {
   *       shortcut.showResult("No value");
   *     },
   *   });
   * }
   * ```
   */
  doesNotExist(left: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：包含。
   *
   * 创建 contains 条件对象，用于 If 控制流判断输入是否包含指定文本。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.contains(message, "Hell"), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  contains(left: unknown, right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：不包含。
   *
   * 创建 doesNotContain 条件对象，用于 If 控制流判断输入是否不包含指定文本。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.doesNotContain(message, "World"), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  doesNotContain(left: unknown, right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：开头是。
   *
   * 创建 beginsWith 条件对象，用于 If 控制流判断输入是否以指定文本开头。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.beginsWith(message, "He"), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  beginsWith(left: unknown, right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件：结尾是。
   *
   * 创建 endsWith 条件对象，用于 If 控制流判断输入是否以指定文本结尾。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.endsWith(message, "lo"), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  endsWith(left: unknown, right: unknown): ShortcutSingleCondition;

  /**
   * 如果条件组：全部满足。
   *
   * 创建 all 条件组，用于 If 控制流要求所有子条件同时满足。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.all([
   *     shortcut.contains(message, "He"),
   *     shortcut.endsWith(message, "lo"),
   *   ]), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  all(conditions: ShortcutSingleCondition[]): ShortcutCondition;

  /**
   * 如果条件组：任一满足。
   *
   * 创建 any 条件组，用于 If 控制流要求任一子条件满足。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   shortcut.if(shortcut.any([
   *     shortcut.equals(message, "Hello"),
   *     shortcut.equals(message, "Hi"),
   *   ]), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *   });
   * }
   * ```
   */
  any(conditions: ShortcutSingleCondition[]): ShortcutCondition;

  /**
   * 如果。
   *
   * 添加 If 控制流，返回该控制流结束 action 的“如果的结果”引用。
   *
   * @example
   * ```ts
   * workflow: (shortcut) => {
   *   const message = shortcut.text("Hello");
   *   const result = shortcut.if(shortcut.exists(message), {
   *     then: (shortcut) => {
   *       shortcut.showResult(message);
   *     },
   *     otherwise: (shortcut) => {
   *       shortcut.notification("No message");
   *     },
   *   });
   *   shortcut.showResult(result);
   * }
   * ```
   */
  if(condition: ShortcutCondition, branches: {
    then: WorkflowBranch;
    otherwise?: WorkflowBranch;
  }): ShortcutValueRef<unknown>;

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
