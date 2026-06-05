import type {
  ShortcutActionNode,
  ShortcutCondition,
  ShortcutDefinition,
  ShortcutDictionary,
  ShortcutNode,
  ShortcutValue,
} from "../core/types.js";
import {
  equals as createEqualsCondition,
  exists as createExistsCondition,
  variable,
} from "../core/value.js";
import { resolveShortcutIcon } from "../core/icon.js";
import * as actionNodes from "./nodes.js";
import type {
  AskForInputOptions,
  BuilderShortcutDefinition,
  ChooseFromListOptions,
  GetContentsOfURLOptions,
  GetItemFromListOptions,
  OpenAppInput,
  RuntimeValue,
  SplitTextSeparator,
  SplitTextOptions,
  ValueInput,
  WorkflowBranch,
  WorkflowBuilder,
} from "./types.js";

type BuilderState = {
  nextOutputIndex: number;
};

/**
 * 定义一个 builder 风格的快捷指令入口，并把开发者声明的 workflow 转成 core 层 ShortcutDefinition。
 *
 * @example
 * ```ts
 * import { defineShortcut, icon } from "shortcutsflow";
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
      kind: "action",
      action: actionName,
      params,
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
  ): RuntimeValue<T> => {
    const { node, output } = outputAction<T>(actionName, params, state);
    nodes.push(node);
    return createRuntimeValue(output);
  };
  const createRuntimeValue = <T>(value: ShortcutValue<T>): RuntimeValue<T> => {
    const runtimeValue = value as RuntimeValue<T>;

    if (typeof runtimeValue.exists === "function") {
      return runtimeValue;
    }

    Object.defineProperties(runtimeValue, {
      replace: {
        value: (find: ValueInput, replace: ValueInput): RuntimeValue<string> =>
          pushOutputAction("replaceText", {
            input: runtimeValue,
            find,
            replace,
          }),
      },
      split: {
        value: (separator?: SplitTextSeparator | SplitTextOptions): RuntimeValue<string[]> =>
          pushOutputAction("splitText", {
            input: runtimeValue,
            options: normalizeSplitOptions(separator),
          }),
      },
      match: {
        value: (pattern: ValueInput): RuntimeValue<string[]> =>
          pushOutputAction("matchText", {
            input: runtimeValue,
            pattern,
          }),
      },
      getDictionaryValue: {
        value: (key: ValueInput): RuntimeValue<unknown> =>
          pushOutputAction("getDictionaryValue", {
            input: runtimeValue,
            key,
          }),
      },
      get: {
        value: (key: ValueInput): RuntimeValue<unknown> =>
          pushOutputAction("getDictionaryValue", {
            input: runtimeValue,
            key,
          }),
      },
      getItem: {
        value: (options: GetItemFromListOptions = {}): RuntimeValue<unknown> =>
          pushOutputAction("getItemFromList", {
            input: runtimeValue,
            options,
          }),
      },
      base64Encode: {
        value: (): RuntimeValue<string> =>
          pushOutputAction("base64", {
            input: runtimeValue,
            mode: "Encode",
          }),
      },
      base64Decode: {
        value: (): RuntimeValue<string> =>
          pushOutputAction("base64", {
            input: runtimeValue,
            mode: "Decode",
          }),
      },
      exists: {
        value: (): ShortcutCondition => createExistsCondition(runtimeValue),
      },
      equals: {
        value: (right: unknown): ShortcutCondition => createEqualsCondition(runtimeValue, right),
      },
    });

    return runtimeValue;
  };
  const collectBranch = (branch: WorkflowBranch): ShortcutNode[] => {
    const branchNodes: ShortcutNode[] = [];
    branch(createWorkflowBuilder(branchNodes, state));
    return branchNodes;
  };

  return {
    comment(textValue: string): void {
      pushAction(actionNodes.comment(textValue));
    },
    text(value: ValueInput): RuntimeValue<string> {
      return pushOutputAction("text", {
        value,
      });
    },
    showResult(input: ValueInput): void {
      pushAction(actionNodes.showResult(input));
    },
    setVariable(name: string, input?: ValueInput): RuntimeValue<string> {
      pushAction(actionNodes.setVariable(name, input));
      return createRuntimeValue(variable(name));
    },
    dictionary(value: ShortcutDictionary): RuntimeValue<ShortcutDictionary> {
      return pushOutputAction("dictionary", {
        value,
      });
    },
    url(value: ValueInput): RuntimeValue<string> {
      return pushOutputAction("url", {
        value,
      });
    },
    openURL(input: ValueInput): void {
      pushAction(actionNodes.openURL(input));
    },
    notification(title: ValueInput, body?: ValueInput): void {
      pushAction(actionNodes.notification(title, body));
    },
    getDictionaryValue(input: ValueInput, key: ValueInput): RuntimeValue<unknown> {
      return pushOutputAction("getDictionaryValue", {
        input,
        key,
      });
    },
    getContentsOfURL(
      input: ValueInput,
      options: GetContentsOfURLOptions = {},
    ): RuntimeValue<unknown> {
      return pushOutputAction("getContentsOfURL", {
        input,
        options,
      });
    },
    base64Encode(input: ValueInput): RuntimeValue<string> {
      return pushOutputAction("base64", {
        input,
        mode: "Encode",
      });
    },
    base64Decode(input: ValueInput): RuntimeValue<string> {
      return pushOutputAction("base64", {
        input,
        mode: "Decode",
      });
    },
    askForInput(
      prompt: ValueInput,
      options: AskForInputOptions = {},
    ): RuntimeValue<string> {
      return pushOutputAction("askForInput", {
        prompt,
        options,
      });
    },
    chooseFromList(
      input: ValueInput,
      options: ChooseFromListOptions = {},
    ): RuntimeValue<unknown> {
      return pushOutputAction("chooseFromList", {
        input,
        options,
      });
    },
    detectDictionary(input: ValueInput): RuntimeValue<ShortcutDictionary> {
      return pushOutputAction("detectDictionary", {
        input,
      });
    },
    matchText(input: ValueInput, pattern: ValueInput): RuntimeValue<string[]> {
      return pushOutputAction("matchText", {
        input,
        pattern,
      });
    },
    splitText(input: ValueInput, options: SplitTextOptions = {}): RuntimeValue<string[]> {
      return pushOutputAction("splitText", {
        input,
        options,
      });
    },
    replaceText(
      input: ValueInput,
      find: ValueInput,
      replace: ValueInput,
    ): RuntimeValue<string> {
      return pushOutputAction("replaceText", {
        input,
        find,
        replace,
      });
    },
    getItemFromList(
      input: ValueInput,
      options: GetItemFromListOptions = {},
    ): RuntimeValue<unknown> {
      return pushOutputAction("getItemFromList", {
        input,
        options,
      });
    },
    delay(seconds: ValueInput): void {
      pushAction(actionNodes.delay(seconds));
    },
    openApp(app: OpenAppInput): void {
      pushAction(actionNodes.openApp(app));
    },
    appendVariable(name: string, input: ValueInput): RuntimeValue<unknown> {
      pushAction(actionNodes.appendVariable(name, input));
      return createRuntimeValue(variable(name) as ShortcutValue<unknown>);
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
    when(condition: ShortcutCondition, then: WorkflowBranch): void {
      nodes.push({
        kind: "if",
        condition,
        then: collectBranch(then),
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
 * 规范化链式 split 调用的分隔符参数。
 */
function normalizeSplitOptions(separator: SplitTextSeparator | SplitTextOptions | undefined): SplitTextOptions {
  return typeof separator === "string"
    ? {
        separator,
      }
    : separator ?? {};
}
