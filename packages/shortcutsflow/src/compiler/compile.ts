import {
  type ShortcutActionNode,
  type ShortcutCondition,
  type ShortcutDefinition,
  type ShortcutIfNode,
  type ShortcutMenuNode,
  type ShortcutNode,
  type ShortcutRepeatEachNode,
  type ShortcutSingleCondition,
} from "../core/types.js";
import { resolveShortcut } from "../core/shortcut.js";
import { serializePlist, type PlistValue } from "../plist/index.js";
import { randomUUID } from "node:crypto";
import { getActionCompiler } from "./action-compilers.js";
import { createCompileContext, type CompileContext } from "./context.js";
import { compileInput, compileTextToken } from "./values.js";
import type { WorkflowAction, WorkflowPlist } from "./schema.js";
import { createWorkflowPlist } from "./workflow.js";

export type CompileResult = {
  name: string;
  plist: WorkflowPlist;
  xml: string;
};

/**
 * 将快捷指令定义编译为 workflow plist 和 XML plist。
 */
export function compileShortcut(definition: ShortcutDefinition): CompileResult {
  const shortcut = resolveShortcut(definition);
  const context = createCompileContext();
  const actions = compileNodes(shortcut.nodes, context);
  const plist = createWorkflowPlist(shortcut, actions);

  return {
    name: shortcut.name,
    plist,
    xml: serializePlist(plist),
  };
}

/**
 * 编译一组 AST 节点为扁平的 Shortcuts action 列表。
 */
function compileNodes(nodes: ShortcutNode[], context: CompileContext): WorkflowAction[] {
  return nodes.flatMap((node) => compileNode(node, context));
}

/**
 * 编译单个 AST 节点为一个或多个 Shortcuts action。
 */
function compileNode(node: ShortcutNode, context: CompileContext): WorkflowAction[] {
  switch (node.kind) {
    case "action":
      return [compileActionNode(node, context)];

    case "if":
      return compileIfNode(node, context);

    case "repeatEach":
      return compileRepeatEachNode(node, context);

    case "menu":
      return compileMenuNode(node, context);

    default:
      throw new Error(`Unsupported node kind: ${(node as ShortcutNode).kind}`);
  }
}

/**
 * 编译单个 action AST 节点为 Shortcuts action。
 */
function compileActionNode(node: ShortcutActionNode, context: CompileContext): WorkflowAction {
  const compiler = getActionCompiler(node.action);

  if (!compiler) {
    throw new Error(`Unsupported action: ${node.action}`);
  }

  const uuid = node.outputName ? randomUUID().toUpperCase() : undefined;
  const parameters = compiler.compile(node, context, uuid);

  if (uuid && node.outputName) {
    context.outputs.set(node.outputName, {
      outputName: compiler.outputName ?? node.outputName,
      uuid,
    });
  }

  return {
    WFWorkflowActionIdentifier: compiler.identifier,
    WFWorkflowActionParameters: parameters,
  };
}

/**
 * 编译 if 控制流为 conditional start / otherwise / end 三段 action。
 */
function compileIfNode(node: ShortcutIfNode, context: CompileContext): WorkflowAction[] {
  const groupingIdentifier = randomUUID().toUpperCase();
  const endUuid = randomUUID().toUpperCase();
  const actions: WorkflowAction[] = [
    workflowAction("is.workflow.actions.conditional", {
      ...compileCondition(node.condition, context),
      GroupingIdentifier: groupingIdentifier,
      WFControlFlowMode: 0,
    }),
    ...compileNodes(node.then, context),
  ];

  if (node.otherwise && node.otherwise.length > 0) {
    actions.push(
      workflowAction("is.workflow.actions.conditional", {
        GroupingIdentifier: groupingIdentifier,
        WFControlFlowMode: 1,
      }),
      ...compileNodes(node.otherwise, context),
    );
  }

  actions.push(
    workflowAction("is.workflow.actions.conditional", {
      GroupingIdentifier: groupingIdentifier,
      WFControlFlowMode: 2,
      UUID: endUuid,
    }),
  );

  if (node.outputName) {
    context.outputs.set(node.outputName, {
      outputName: "如果的结果",
      uuid: endUuid,
    });
  }

  return actions;
}

/**
 * 编译 repeat each 控制流为 repeat start / body / end 三段 action。
 */
function compileRepeatEachNode(
  node: ShortcutRepeatEachNode,
  context: CompileContext,
): WorkflowAction[] {
  const groupingIdentifier = randomUUID().toUpperCase();

  return [
    workflowAction("is.workflow.actions.repeat.each", {
      WFInput: compileInput(node.input, context),
      GroupingIdentifier: groupingIdentifier,
      WFControlFlowMode: 0,
    }),
    ...compileNodes(node.body, context),
    workflowAction("is.workflow.actions.repeat.each", {
      GroupingIdentifier: groupingIdentifier,
      WFControlFlowMode: 2,
      UUID: randomUUID().toUpperCase(),
    }),
  ];
}

/**
 * 编译菜单控制流为 menu start / menu item / end action 列表。
 */
function compileMenuNode(node: ShortcutMenuNode, context: CompileContext): WorkflowAction[] {
  const groupingIdentifier = randomUUID().toUpperCase();
  const actions: WorkflowAction[] = [
    workflowAction("is.workflow.actions.choosefrommenu", {
      WFMenuPrompt: node.prompt,
      WFMenuItems: node.items.map((item) => item.title),
      GroupingIdentifier: groupingIdentifier,
      WFControlFlowMode: 0,
    }),
  ];

  for (const item of node.items) {
    actions.push(
      workflowAction("is.workflow.actions.choosefrommenu", {
        WFMenuItemTitle: item.title,
        GroupingIdentifier: groupingIdentifier,
        WFControlFlowMode: 1,
      }),
      ...compileNodes(item.body, context),
    );
  }

  actions.push(
    workflowAction("is.workflow.actions.choosefrommenu", {
      GroupingIdentifier: groupingIdentifier,
      WFControlFlowMode: 2,
      UUID: randomUUID().toUpperCase(),
    }),
  );

  return actions;
}

/**
 * 创建底层 Shortcuts action 数据结构。
 */
function workflowAction(
  identifier: string,
  parameters: Record<string, PlistValue>,
): WorkflowAction {
  return {
    WFWorkflowActionIdentifier: identifier,
    WFWorkflowActionParameters: parameters,
  };
}

/**
 * 编译框架条件对象为 Shortcuts conditional 参数。
 */
function compileCondition(
  condition: ShortcutCondition,
  context: CompileContext,
): Record<string, PlistValue> {
  if (condition.kind === "condition-group") {
    if (condition.conditions.length === 0) {
      throw new Error("If condition group must contain at least one condition");
    }

    return {
      WFConditions: {
        Value: {
          WFActionParameterFilterPrefix: condition.mode === "all" ? 0 : 1,
          WFContentPredicateBoundedDate: false,
          WFActionParameterFilterTemplates: condition.conditions.map((item) =>
            compileSingleCondition(item, context),
          ),
        },
        WFSerializationType: "WFContentPredicateTableTemplate",
      },
    };
  }

  return compileSingleCondition(condition, context);
}

/**
 * 编译单个 If 条件为 Shortcuts conditional 参数。
 */
function compileSingleCondition(
  condition: ShortcutSingleCondition,
  context: CompileContext,
): Record<string, PlistValue> {
  const parameters: Record<string, PlistValue> = {
    WFInput: compileConditionInput(condition.left, context),
    WFCondition: conditionCode(condition),
  };

  if (condition.right !== undefined) {
    parameters.WFConditionalActionString = compileTextToken(condition.right, context);
  }

  return parameters;
}

/**
 * 读取 Shortcuts If 条件编号。
 */
function conditionCode(condition: ShortcutSingleCondition): number {
  switch (condition.operator) {
    case "equals":
      return 4;

    case "notEquals":
      return 5;

    case "exists":
      return 100;

    case "doesNotExist":
      return 101;

    case "contains":
      return 99;

    case "doesNotContain":
      return 999;

    case "beginsWith":
      return 8;

    case "endsWith":
      return 9;

    default:
      throw new Error(`Unsupported condition operator: ${condition.operator}`);
  }
}

/**
 * 编译 conditional action 使用的输入包装。
 */
function compileConditionInput(value: unknown, context: CompileContext): PlistValue {
  return {
    Type: "Variable",
    Variable: compileInput(value, context),
  };
}
