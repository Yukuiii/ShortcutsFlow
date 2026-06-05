import type {
  ShortcutActionNode,
  ShortcutCondition,
  ShortcutDefinition,
  ShortcutDictionary,
  ShortcutNode,
  ShortcutValue,
} from "@shortcutsflow/core";
import {
  equals as createEqualsCondition,
  exists as createExistsCondition,
  resolveShortcutIcon,
  variable,
} from "@shortcutsflow/core";
import * as actionNodes from "./nodes.js";
import type {
  BuilderShortcutDefinition,
  GetContentsOfURLOptions,
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
      pushAction(actionNodes.comment(textValue));
    },
    text(value: ValueInput): ShortcutValue<string> {
      return pushOutputAction("text", {
        value,
      });
    },
    showResult(input: ValueInput): void {
      pushAction(actionNodes.showResult(input));
    },
    setVariable(name: string, input?: ValueInput): ShortcutValue<string> {
      pushAction(actionNodes.setVariable(name, input));
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
      pushAction(actionNodes.openURL(input));
    },
    notification(title: ValueInput, body?: ValueInput): void {
      pushAction(actionNodes.notification(title, body));
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
