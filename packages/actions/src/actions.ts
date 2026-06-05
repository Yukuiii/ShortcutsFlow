import type {
  ShortcutActionNode,
  ShortcutCondition,
  ShortcutDefinition,
  ShortcutDictionary,
  ShortcutIconInput,
  ShortcutMenuNode,
  ShortcutNode,
  ShortcutRepeatEachNode,
  ShortcutValue,
} from "@shortcutsflow/core";
import {
  equals as createEqualsCondition,
  exists as createExistsCondition,
  resolveShortcutIcon,
  variable,
} from "@shortcutsflow/core";

type ValueInput = string | number | boolean | ShortcutValue;

type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type GetContentsOfURLOptions = {
  method?: HTTPMethod;
  headers?: ShortcutDictionary;
};

type MenuItems = Record<string, ShortcutNode[]>;

export type WorkflowBranch = (shortcut: WorkflowBuilder) => void;

export type BuilderShortcutDefinition = {
  name: string;
  icon?: ShortcutIconInput;
  workflow: WorkflowBranch;
};

type BuilderState = {
  nextOutputIndex: number;
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

/**
 * 定义一个 builder 风格的快捷指令入口，并把开发者声明的 workflow 转成 core 层 ShortcutDefinition。
 *
 * @example
 * ```ts
 * import { defineShortcut } from "@shortcutsflow/actions";
 * import { icon } from "@shortcutsflow/core";
 *
 * export default defineShortcut({
 *   name: "Basic Shortcut",
 *   icon: icon.create(icon.color.blue, icon.glyph.apple),
 *   workflow: (shortcut) => {
 *     const message = shortcut.text("Hello");
 *     shortcut.showResult(message);
 *   },
 * });
 * ```
 */
export function defineShortcut(definition: BuilderShortcutDefinition): ShortcutDefinition {
  const nodes: ShortcutNode[] = [];
  const state: BuilderState = {
    nextOutputIndex: 0,
  };
  const builder = createWorkflowBuilder(nodes, state);

  definition.workflow(builder);

  return {
    name: definition.name,
    icon: resolveShortcutIcon(definition.icon),
    workflow: () => nodes,
  };
}

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
 * 创建可被后续 action 引用的输出 action 节点。
 */
function outputAction<T>(
  actionName: string,
  params: Record<string, unknown>,
  state: BuilderState,
): {
  node: ShortcutActionNode;
  output: ShortcutValue<T>;
} {
  const outputName = `__output_${state.nextOutputIndex++}`;

  return {
    node: {
      ...action(actionName, params),
      outputName,
    },
    output: variable(outputName) as ShortcutValue<T>,
  };
}

/**
 * 创建用于收集 workflow 节点的 builder。
 */
function createWorkflowBuilder(nodes: ShortcutNode[], state: BuilderState): WorkflowBuilder {
  const pushAction = (node: ShortcutActionNode): void => {
    nodes.push(node);
  };
  const pushOutputAction = <T>(
    actionName: string,
    params: Record<string, unknown>,
  ): ShortcutValue<T> => {
    const { node, output } = outputAction<T>(actionName, params, state);
    nodes.push(node);
    return output;
  };
  const collectBranch = (branch: WorkflowBranch): ShortcutNode[] => {
    const branchNodes: ShortcutNode[] = [];
    branch(createWorkflowBuilder(branchNodes, state));
    return branchNodes;
  };

  return {
    comment(textValue: string): void {
      pushAction(comment(textValue));
    },
    text(value: ValueInput): ShortcutValue<string> {
      return pushOutputAction("text", {
        value,
      });
    },
    showResult(input: ValueInput): void {
      pushAction(showResult(input));
    },
    setVariable(name: string, input?: ValueInput): ShortcutValue<string> {
      pushAction(setVariable(name, input));
      return variable(name);
    },
    dictionary(value: ShortcutDictionary): ShortcutValue<ShortcutDictionary> {
      return pushOutputAction("dictionary", {
        value,
      });
    },
    url(value: ValueInput): ShortcutValue<string> {
      return pushOutputAction("url", {
        value,
      });
    },
    openURL(input: ValueInput): void {
      pushAction(openURL(input));
    },
    notification(title: ValueInput, body?: ValueInput): void {
      pushAction(notification(title, body));
    },
    getValueForKey(input: ValueInput, key: ValueInput): ShortcutValue<unknown> {
      return pushOutputAction("getValueForKey", {
        input,
        key,
      });
    },
    getContentsOfURL(
      input: ValueInput,
      options: GetContentsOfURLOptions = {},
    ): ShortcutValue<unknown> {
      return pushOutputAction("getContentsOfURL", {
        input,
        options,
      });
    },
    base64Encode(input: ValueInput): ShortcutValue<string> {
      return pushOutputAction("base64", {
        input,
        mode: "Encode",
      });
    },
    base64Decode(input: ValueInput): ShortcutValue<string> {
      return pushOutputAction("base64", {
        input,
        mode: "Decode",
      });
    },
    exists(left: unknown): ShortcutCondition {
      return createExistsCondition(left);
    },
    equals(left: unknown, right: unknown): ShortcutCondition {
      return createEqualsCondition(left, right);
    },
    if(condition: ShortcutCondition, branches: {
      then: WorkflowBranch;
      otherwise?: WorkflowBranch;
    }): void {
      nodes.push({
        kind: "if",
        condition,
        then: collectBranch(branches.then),
        otherwise: branches.otherwise ? collectBranch(branches.otherwise) : undefined,
      });
    },
    repeatEach(input: ValueInput, body: WorkflowBranch): void {
      nodes.push({
        kind: "repeatEach",
        input,
        body: collectBranch(body),
      });
    },
    chooseFromMenu(prompt: string, items: Record<string, WorkflowBranch>): void {
      nodes.push({
        kind: "menu",
        prompt,
        items: Object.entries(items).map(([title, body]) => ({
          title,
          body: collectBranch(body),
        })),
      });
    },
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
