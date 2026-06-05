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
   * 添加一条 Shortcuts 注释动作。
   */
  comment(text: string): void;

  /**
   * 添加 Text 动作并返回该动作的输出引用。
   */
  text(value: ValueInput): ShortcutValue<string>;

  /**
   * 添加 Show Result 动作用于展示输入值。
   */
  showResult(input: ValueInput): void;

  /**
   * 添加 Set Variable 动作并返回该运行期变量引用。
   */
  setVariable(name: string, input?: ValueInput): ShortcutValue<string>;

  /**
   * 添加 Dictionary 动作并返回该动作的输出引用。
   */
  dictionary(value: ShortcutDictionary): ShortcutValue<ShortcutDictionary>;

  /**
   * 添加 URL 动作并返回该动作的输出引用。
   */
  url(value: ValueInput): ShortcutValue<string>;

  /**
   * 添加 Open URL 动作用于打开输入 URL。
   */
  openURL(input: ValueInput): void;

  /**
   * 添加 Show Notification 动作用于显示通知。
   */
  notification(title: ValueInput, body?: ValueInput): void;

  /**
   * 添加 Get Dictionary Value 动作并返回该动作的输出引用。
   */
  getValueForKey(input: ValueInput, key: ValueInput): ShortcutValue<unknown>;

  /**
   * 添加 Get Contents of URL 动作并返回该动作的输出引用。
   */
  getContentsOfURL(input: ValueInput, options?: GetContentsOfURLOptions): ShortcutValue<unknown>;

  /**
   * 添加 Base64 Encode 动作并返回该动作的输出引用。
   */
  base64Encode(input: ValueInput): ShortcutValue<string>;

  /**
   * 添加 Base64 Decode 动作并返回该动作的输出引用。
   */
  base64Decode(input: ValueInput): ShortcutValue<string>;

  /**
   * 创建 Shortcuts 存在性判断条件。
   */
  exists(left: unknown): ShortcutCondition;

  /**
   * 创建 Shortcuts 相等判断条件。
   */
  equals(left: unknown, right: unknown): ShortcutCondition;

  /**
   * 添加 If 控制流。
   */
  if(condition: ShortcutCondition, branches: {
    then: WorkflowBranch;
    otherwise?: WorkflowBranch;
  }): void;

  /**
   * 添加 Repeat with Each 控制流。
   */
  repeatEach(input: ValueInput, body: WorkflowBranch): void;

  /**
   * 添加 Choose from Menu 控制流。
   */
  chooseFromMenu(prompt: string, items: Record<string, WorkflowBranch>): void;
};

/**
 * 定义一个 builder 风格的快捷指令入口。
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
 * 创建 Shortcuts 注释动作。
 */
export function comment(text: string): ShortcutActionNode {
  return action("comment", {
    text,
  });
}

/**
 * 创建 Shortcuts 文本动作。
 */
export function text(value: ValueInput): ShortcutActionNode {
  return action("text", {
    value,
  });
}

/**
 * 创建 Shortcuts 显示结果动作。
 */
export function showResult(input: ValueInput): ShortcutActionNode {
  return action("showResult", {
    input,
  });
}

/**
 * 创建 Shortcuts 设置变量动作。
 */
export function setVariable(name: string, input?: ValueInput): ShortcutActionNode {
  return action("setVariable", {
    name,
    input,
  });
}

/**
 * 创建 Shortcuts 字典动作。
 */
export function dictionary(value: ShortcutDictionary): ShortcutActionNode {
  return action("dictionary", {
    value,
  });
}

/**
 * 创建 Shortcuts URL 动作。
 */
export function url(value: ValueInput): ShortcutActionNode {
  return action("url", {
    value,
  });
}

/**
 * 创建 Shortcuts 打开 URL 动作。
 */
export function openURL(input: ValueInput): ShortcutActionNode {
  return action("openURL", {
    input,
  });
}

/**
 * 创建 Shortcuts 显示通知动作。
 */
export function notification(title: ValueInput, body?: ValueInput): ShortcutActionNode {
  return action("notification", {
    title,
    body,
  });
}

/**
 * 创建 Shortcuts 从词典获取值动作。
 */
export function getValueForKey(input: ValueInput, key: ValueInput): ShortcutActionNode {
  return action("getValueForKey", {
    input,
    key,
  });
}

/**
 * 创建 Shortcuts 获取 URL 内容动作。
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
 * 创建 Shortcuts Base64 编码动作。
 */
export function base64Encode(input: ValueInput): ShortcutActionNode {
  return action("base64", {
    input,
    mode: "Encode",
  });
}

/**
 * 创建 Shortcuts Base64 解码动作。
 */
export function base64Decode(input: ValueInput): ShortcutActionNode {
  return action("base64", {
    input,
    mode: "Decode",
  });
}

/**
 * 创建 Shortcuts 条件控制流。
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
 * 创建 Shortcuts 遍历重复控制流。
 */
export function repeatEach(input: ValueInput, body: ShortcutNode[]): ShortcutRepeatEachNode {
  return {
    kind: "repeatEach",
    input,
    body,
  };
}

/**
 * 创建 Shortcuts 菜单控制流。
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
