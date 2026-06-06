import type {
  ShortcutActionNode,
  ShortcutCondition,
  ShortcutDefinition,
  ShortcutDictionary,
  ShortcutIfNode,
  ShortcutNode,
  ShortcutSingleCondition,
  ShortcutValue,
} from "../core/types.js";
import {
  actionOutput,
  all as createAllConditionGroup,
  any as createAnyConditionGroup,
  beginsWith as createBeginsWithCondition,
  contains as createContainsCondition,
  doesNotContain as createDoesNotContainCondition,
  doesNotExist as createDoesNotExistCondition,
  endsWith as createEndsWithCondition,
  equals as createEqualsCondition,
  exists as createExistsCondition,
  isShortcutValue,
  notEquals as createNotEqualsCondition,
  variable as createVariableReference,
} from "../core/value.js";
import { resolveShortcutIcon } from "../core/icon.js";
import * as actionNodes from "./nodes.js";
import type {
  AskForInputOptions,
  BuilderShortcutDefinition,
  ChooseFromListOptions,
  DictionaryValueFor,
  GetContentsOfURLOptions,
  GetItemFromListOptions,
  OpenAppInput,
  ShortcutValueRef,
  ShortcutVariableRef,
  ShowAlertOptions,
  SplitTextSeparator,
  SplitTextOptions,
  ValueInput,
  ValueInputListItem,
  ValueInputValue,
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
    output: actionOutput<T>(outputName),
  };
}

/**
 * 创建可被后续 action 引用的 If 控制流节点。
 */
function outputIfAction(
  condition: ShortcutCondition,
  branches: {
    then: ShortcutNode[];
    otherwise?: ShortcutNode[];
  },
  state: BuilderState,
): {
  node: ShortcutIfNode;
  output: ShortcutValue<unknown>;
} {
  const outputName = `__output_${state.nextOutputIndex++}`;

  return {
    node: {
      kind: "if",
      condition,
      then: branches.then,
      otherwise: branches.otherwise,
      outputName,
    },
    output: actionOutput(outputName),
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
  ): ShortcutValueRef<T> => {
    const { node, output } = outputAction<T>(actionName, params, state);
    nodes.push(node);
    return createShortcutValueRef(output);
  };
  const createShortcutValueRef = <T>(value: ShortcutValue<T>): ShortcutValueRef<T> => {
    const shortcutValueRef = value as unknown as ShortcutValueRef<T>;

    if (typeof shortcutValueRef.exists === "function") {
      return shortcutValueRef;
    }

    Object.defineProperties(shortcutValueRef, {
      replace: {
        value: (find: ValueInput, replace: ValueInput): ShortcutValueRef<string> =>
          pushOutputAction("replaceText", {
            input: shortcutValueRef,
            find,
            replace,
          }),
      },
      split: {
        value: (separator?: SplitTextSeparator | SplitTextOptions): ShortcutValueRef<string[]> =>
          pushOutputAction("splitText", {
            input: shortcutValueRef,
            options: normalizeSplitOptions(separator),
          }),
      },
      match: {
        value: (pattern: ValueInput): ShortcutValueRef<string[]> =>
          pushOutputAction("matchText", {
            input: shortcutValueRef,
            pattern,
          }),
      },
      getDictionaryValue: {
        value: <TKey extends ValueInput>(
          key: TKey,
        ): ShortcutValueRef<DictionaryValueFor<ShortcutValueRef<T>, TKey>> =>
          pushOutputAction<DictionaryValueFor<ShortcutValueRef<T>, TKey>>("getDictionaryValue", {
            input: shortcutValueRef,
            key,
          }),
      },
      get: {
        value: <TKey extends ValueInput>(
          key: TKey,
        ): ShortcutValueRef<DictionaryValueFor<ShortcutValueRef<T>, TKey>> =>
          pushOutputAction<DictionaryValueFor<ShortcutValueRef<T>, TKey>>("getDictionaryValue", {
            input: shortcutValueRef,
            key,
          }),
      },
      getItem: {
        value: (
          options: GetItemFromListOptions = {},
        ): ShortcutValueRef<ValueInputListItem<ShortcutValueRef<T>>> =>
          pushOutputAction<ValueInputListItem<ShortcutValueRef<T>>>("getItemFromList", {
            input: shortcutValueRef,
            options,
          }),
      },
      base64Encode: {
        value: (): ShortcutValueRef<string> =>
          pushOutputAction("base64", {
            input: shortcutValueRef,
            mode: "Encode",
          }),
      },
      base64Decode: {
        value: (): ShortcutValueRef<string> =>
          pushOutputAction("base64", {
            input: shortcutValueRef,
            mode: "Decode",
          }),
      },
      exists: {
        value: (): ShortcutSingleCondition => createExistsCondition(shortcutValueRef),
      },
      equals: {
        value: (right: unknown): ShortcutSingleCondition =>
          createEqualsCondition(shortcutValueRef, right),
      },
      notEquals: {
        value: (right: unknown): ShortcutSingleCondition =>
          createNotEqualsCondition(shortcutValueRef, right),
      },
      doesNotExist: {
        value: (): ShortcutSingleCondition => createDoesNotExistCondition(shortcutValueRef),
      },
      contains: {
        value: (right: unknown): ShortcutSingleCondition =>
          createContainsCondition(shortcutValueRef, right),
      },
      doesNotContain: {
        value: (right: unknown): ShortcutSingleCondition =>
          createDoesNotContainCondition(shortcutValueRef, right),
      },
      beginsWith: {
        value: (right: unknown): ShortcutSingleCondition =>
          createBeginsWithCondition(shortcutValueRef, right),
      },
      endsWith: {
        value: (right: unknown): ShortcutSingleCondition =>
          createEndsWithCondition(shortcutValueRef, right),
      },
    });

    return shortcutValueRef;
  };
  const createShortcutVariableRef = <T>(name: string): ShortcutVariableRef<T> => {
    const shortcutVariableRef = createShortcutValueRef(createVariableReference(name)) as ShortcutVariableRef<T>;

    if (typeof shortcutVariableRef.set === "function") {
      return shortcutVariableRef;
    }

    Object.defineProperties(shortcutVariableRef, {
      set: {
        value: <TInput extends ValueInput | undefined = undefined>(
          input?: TInput,
        ): ShortcutVariableRef<ValueInputValue<TInput>> => {
          pushAction(actionNodes.setVariable(name, input));
          return createShortcutVariableRef<ValueInputValue<TInput>>(name);
        },
      },
      append: {
        value: (input: ValueInput): ShortcutVariableRef<unknown> => {
          pushAction(actionNodes.appendVariable(name, input));
          return createShortcutVariableRef(name);
        },
      },
    });

    return shortcutVariableRef;
  };
  const collectBranch = (branch: WorkflowBranch): ShortcutNode[] => {
    const branchNodes: ShortcutNode[] = [];
    branch(createWorkflowBuilder(branchNodes, state));
    return branchNodes;
  };

  return {
    comment(textValue: ValueInput): void {
      pushAction(actionNodes.comment(textValue));
    },
    text(value: ValueInput): ShortcutValueRef<string> {
      return pushOutputAction("text", {
        value,
      });
    },
    showResult(input: ValueInput): void {
      pushAction(actionNodes.showResult(input));
    },
    showAlert(
      title: ValueInput,
      message: ValueInput,
      options: ShowAlertOptions = {},
    ): void {
      pushAction(actionNodes.showAlert(title, message, options));
    },
    setVariable<TInput extends ValueInput | undefined = undefined>(
      name: string,
      input?: TInput,
    ): ShortcutVariableRef<ValueInputValue<TInput>> {
      pushAction(actionNodes.setVariable(name, input));
      return createShortcutVariableRef<ValueInputValue<TInput>>(name);
    },
    variable<TInput extends ValueInput | undefined = undefined>(
      name: string,
      input?: TInput,
    ): ShortcutVariableRef<ValueInputValue<TInput>> {
      pushAction(actionNodes.setVariable(name, input));
      return createShortcutVariableRef<ValueInputValue<TInput>>(name);
    },
    dictionary<TValue extends ShortcutDictionary>(value: TValue): ShortcutValueRef<TValue> {
      return pushOutputAction<TValue>("dictionary", {
        value,
      });
    },
    url(value: ValueInput): ShortcutValueRef<string> {
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
    getDictionaryValue<TInput extends ValueInput, TKey extends ValueInput>(
      input: TInput,
      key: TKey,
    ): ShortcutValueRef<DictionaryValueFor<TInput, TKey>> {
      return pushOutputAction<DictionaryValueFor<TInput, TKey>>("getDictionaryValue", {
        input,
        key,
      });
    },
    getContentsOfURL(
      input: ValueInput,
      options: GetContentsOfURLOptions = {},
    ): ShortcutValueRef<unknown> {
      return pushOutputAction("getContentsOfURL", {
        input,
        options,
      });
    },
    base64Encode(input: ValueInput): ShortcutValueRef<string> {
      return pushOutputAction("base64", {
        input,
        mode: "Encode",
      });
    },
    base64Decode(input: ValueInput): ShortcutValueRef<string> {
      return pushOutputAction("base64", {
        input,
        mode: "Decode",
      });
    },
    askForInput(
      promptOrOptions?: ValueInput | AskForInputOptions,
      options: AskForInputOptions = {},
    ): ShortcutValueRef<string> {
      const normalized = normalizeAskForInputArguments(promptOrOptions, options);

      return pushOutputAction("askForInput", {
        prompt: normalized.prompt,
        options: normalized.options,
      });
    },
    chooseFromList<TInput extends ValueInput>(
      input: TInput,
      options: ChooseFromListOptions = {},
    ): ShortcutValueRef<ValueInputListItem<TInput>> {
      return pushOutputAction<ValueInputListItem<TInput>>("chooseFromList", {
        input,
        options,
      });
    },
    detectDictionary(input: ValueInput): ShortcutValueRef<ShortcutDictionary> {
      return pushOutputAction("detectDictionary", {
        input,
      });
    },
    matchText(input: ValueInput, pattern: ValueInput): ShortcutValueRef<string[]> {
      return pushOutputAction("matchText", {
        input,
        pattern,
      });
    },
    splitText(input: ValueInput, options: SplitTextOptions = {}): ShortcutValueRef<string[]> {
      return pushOutputAction("splitText", {
        input,
        options,
      });
    },
    replaceText(
      input: ValueInput,
      find: ValueInput,
      replace: ValueInput,
    ): ShortcutValueRef<string> {
      return pushOutputAction("replaceText", {
        input,
        find,
        replace,
      });
    },
    getItemFromList<TInput extends ValueInput>(
      input: TInput,
      options: GetItemFromListOptions = {},
    ): ShortcutValueRef<ValueInputListItem<TInput>> {
      return pushOutputAction<ValueInputListItem<TInput>>("getItemFromList", {
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
    appendVariable(name: string, input: ValueInput): ShortcutVariableRef<unknown> {
      pushAction(actionNodes.appendVariable(name, input));
      return createShortcutVariableRef(name);
    },
    exists(left: unknown): ShortcutSingleCondition {
      return createExistsCondition(left);
    },
    equals(left: unknown, right: unknown): ShortcutSingleCondition {
      return createEqualsCondition(left, right);
    },
    notEquals(left: unknown, right: unknown): ShortcutSingleCondition {
      return createNotEqualsCondition(left, right);
    },
    doesNotExist(left: unknown): ShortcutSingleCondition {
      return createDoesNotExistCondition(left);
    },
    contains(left: unknown, right: unknown): ShortcutSingleCondition {
      return createContainsCondition(left, right);
    },
    doesNotContain(left: unknown, right: unknown): ShortcutSingleCondition {
      return createDoesNotContainCondition(left, right);
    },
    beginsWith(left: unknown, right: unknown): ShortcutSingleCondition {
      return createBeginsWithCondition(left, right);
    },
    endsWith(left: unknown, right: unknown): ShortcutSingleCondition {
      return createEndsWithCondition(left, right);
    },
    all(conditions: ShortcutSingleCondition[]): ShortcutCondition {
      return createAllConditionGroup(conditions);
    },
    any(conditions: ShortcutSingleCondition[]): ShortcutCondition {
      return createAnyConditionGroup(conditions);
    },
    if(condition: ShortcutCondition, branches: {
      then: WorkflowBranch;
      otherwise?: WorkflowBranch;
    }): ShortcutValueRef<unknown> {
      const { node, output } = outputIfAction(
        condition,
        {
          then: collectBranch(branches.then),
          otherwise: branches.otherwise ? collectBranch(branches.otherwise) : undefined,
        },
        state,
      );

      nodes.push(node);
      return createShortcutValueRef(output);
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
 * 规范化 askForInput 的 prompt+options 和 options-only 两种调用形式。
 */
function normalizeAskForInputArguments(
  promptOrOptions: ValueInput | AskForInputOptions | undefined,
  options: AskForInputOptions,
): {
  prompt?: ValueInput;
  options: AskForInputOptions;
} {
  return isAskForInputOptions(promptOrOptions)
    ? {
        options: promptOrOptions,
      }
    : {
        prompt: promptOrOptions,
        options,
      };
}

/**
 * 判断第一个 askForInput 参数是否为 options 对象。
 */
function isAskForInputOptions(
  value: ValueInput | AskForInputOptions | undefined,
): value is AskForInputOptions {
  return typeof value === "object" && value !== null && !isShortcutValue(value);
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
