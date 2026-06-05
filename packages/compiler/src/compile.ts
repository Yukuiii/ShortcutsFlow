import {
  isShortcutValue,
  resolveShortcut,
  type ShortcutActionNode,
  type ShortcutCondition,
  type ShortcutDefinition,
  type ShortcutDictionary,
  type ShortcutDictionaryValue,
  type ShortcutIfNode,
  type ShortcutMenuNode,
  type ShortcutNode,
  type ShortcutRepeatEachNode,
  type ShortcutValue,
} from "@shortcutsflow/core";
import { serializePlist, type PlistValue } from "@shortcutsflow/plist";
import { randomUUID } from "node:crypto";
import { actionSchemas, type WorkflowAction, type WorkflowPlist } from "./schema.js";
import { createWorkflowPlist } from "./workflow.js";

export type CompileResult = {
  name: string;
  plist: WorkflowPlist;
  xml: string;
};

type CompileContext = {
  outputs: Map<string, {
    outputName: string;
    uuid: string;
  }>;
};

/**
 * 将快捷指令定义编译为 workflow plist 和 XML plist。
 */
export function compileShortcut(definition: ShortcutDefinition): CompileResult {
  const shortcut = resolveShortcut(definition);
  const context: CompileContext = {
    outputs: new Map(),
  };
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
  const schema = actionSchemas[node.action];

  if (!schema) {
    throw new Error(`Unsupported action: ${node.action}`);
  }

  const uuid = node.outputName ? randomUUID().toUpperCase() : undefined;
  const parameters = compileActionParameters(node, context, uuid);

  if (uuid && node.outputName) {
    context.outputs.set(node.outputName, {
      outputName: schema.outputName ?? node.outputName,
      uuid,
    });
  }

  return {
    WFWorkflowActionIdentifier: schema.identifier,
    WFWorkflowActionParameters: parameters,
  };
}

/**
 * 编译 if 控制流为 conditional start / otherwise / end 三段 action。
 */
function compileIfNode(node: ShortcutIfNode, context: CompileContext): WorkflowAction[] {
  const groupingIdentifier = randomUUID().toUpperCase();
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
      UUID: randomUUID().toUpperCase(),
    }),
  );

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
  switch (condition.operator) {
    case "exists":
      return {
        WFInput: compileConditionInput(condition.left, context),
        WFCondition: 100,
      };

    case "equals":
      return {
        WFInput: compileConditionInput(condition.left, context),
        WFConditionalActionString: compileTextToken(condition.right, context),
        WFCondition: 4,
      };

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

/**
 * 根据 action 类型编译参数 key 和参数值。
 */
function compileActionParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  switch (node.action) {
    case "comment":
      return {
        WFCommentActionText: String(node.params.text ?? ""),
      };

    case "appendVariable":
      return {
        WFInput: compileInput(node.params.input, context),
        WFVariableName: String(node.params.name ?? ""),
      };

    case "askForInput":
      return withUuid(uuid, compileAskForInputParameters(node, context));

    case "base64":
      return withUuid(uuid, {
        WFInput: compileInput(node.params.input, context),
        WFEncodeMode: String(node.params.mode ?? "Encode"),
      });

    case "chooseFromList":
      return withUuid(uuid, compileChooseFromListParameters(node, context));

    case "delay":
      return {
        WFDelayTime: compileParameterValue(node.params.seconds, context),
      };

    case "detectDictionary":
      return withUuid(uuid, {
        WFInput: compileInput(node.params.input, context),
      });

    case "dictionary":
      return withUuid(uuid, {
        WFItems: compileDictionary(node.params.value as ShortcutDictionary),
      });

    case "getContentsOfURL":
      return withUuid(uuid, {
        ...compileGetContentsOfURLParameters(node, context),
      });

    case "getItemFromList":
      return withUuid(uuid, compileGetItemFromListParameters(node, context));

    case "getDictionaryValue":
      return withUuid(uuid, {
        WFInput: compileInput(node.params.input, context),
        WFDictionaryKey: compileTextToken(node.params.key, context),
      });

    case "matchText":
      return withUuid(uuid, {
        text: compileTextToken(node.params.input, context),
        WFMatchTextPattern: compileTextToken(node.params.pattern, context),
      });

    case "notification":
      return {
        WFNotificationActionTitle: compileTextToken(node.params.title, context),
        ...(node.params.body === undefined
          ? {}
          : {
              WFNotificationActionBody: compileTextToken(node.params.body, context),
            }),
      };

    case "openURL":
      return {
        WFInput: compileInput(node.params.input, context),
        "Show-WFInput": true,
      };

    case "openApp":
      return compileOpenAppParameters(node);

    case "replaceText":
      return withUuid(uuid, {
        WFInput: compileTextToken(node.params.input, context),
        WFReplaceTextFind: compileTextToken(node.params.find, context),
        WFReplaceTextReplace: compileTextToken(node.params.replace, context),
      });

    case "setVariable":
      return {
        ...(node.params.input === undefined
          ? {}
          : {
              WFInput: compileInput(node.params.input, context),
            }),
        WFVariableName: String(node.params.name ?? ""),
      };

    case "showResult":
      return {
        WFInput: compileInput(node.params.input, context),
      };

    case "splitText":
      return withUuid(uuid, compileSplitTextParameters(node, context));

    case "text":
      return withUuid(uuid, {
        WFTextActionText: compileTextToken(node.params.value, context),
      });

    case "url":
      return withUuid(uuid, {
        WFURLActionURL: compileTextToken(node.params.value, context),
      });

    default:
      throw new Error(`Unsupported action parameters: ${node.action}`);
  }
}

/**
 * 在 action 有输出名称时写入 UUID。
 */
function withUuid(
  uuid: string | undefined,
  parameters: Record<string, PlistValue>,
): Record<string, PlistValue> {
  return uuid ? { ...parameters, UUID: uuid } : parameters;
}

/**
 * 编译可以作为 action 输入的值。
 */
function compileInput(value: unknown, context: CompileContext): PlistValue {
  if (isShortcutValue(value)) {
    return compileShortcutValue(value, context);
  }

  return compileTextToken(value, context);
}

/**
 * 编译字符串或变量插值形式的文本 token。
 */
function compileTextToken(value: unknown, context: CompileContext): PlistValue {
  if (isShortcutValue(value)) {
    return {
      Value: {
        string: "￼",
        attachmentsByRange: {
          "{0, 1}": compileAttachmentValue(value, context),
        },
      },
      WFSerializationType: "WFTextTokenString",
    };
  }

  return String(value ?? "");
}

/**
 * 编译框架内部值引用为 Shortcuts 变量 attachment。
 */
function compileShortcutValue(value: ShortcutValue, context: CompileContext): PlistValue {
  if (value.kind === "variable") {
    return {
      Value: compileAttachmentValue(value, context),
      WFSerializationType: "WFTextTokenAttachment",
    };
  }

  if (value.kind === "literal") {
    return compileTextToken(value.value, context);
  }

  throw new Error(`Unsupported shortcut value kind: ${value.kind}`);
}

/**
 * 编译可嵌入文本 token 的变量 payload。
 */
function compileAttachmentValue(value: ShortcutValue, context: CompileContext): PlistValue {
  if (value.kind === "variable") {
    const name = String(value.value);
    const output = context.outputs.get(name);

    return output
      ? {
          Type: "ActionOutput",
          OutputName: output.outputName,
          OutputUUID: output.uuid,
        }
      : {
          Type: "Variable",
          VariableName: name,
        };
  }

  if (value.kind === "literal") {
    return {
      Type: "Variable",
      VariableName: String(value.value ?? ""),
    };
  }

  throw new Error(`Unsupported shortcut value kind: ${value.kind}`);
}

/**
 * 编译普通参数值，并在非变量字面量时保留数字和布尔类型。
 */
function compileParameterValue(value: unknown, context: CompileContext): PlistValue {
  if (isShortcutValue(value)) {
    return compileShortcutValue(value, context);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return compileTextToken(value, context);
}

/**
 * 编译请求输入动作的提示和默认答案参数。
 */
function compileAskForInputParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  const options = (node.params.options ?? {}) as {
    defaultAnswer?: unknown;
  };

  return {
    WFAskActionPrompt: compileTextToken(node.params.prompt, context),
    ...(options.defaultAnswer === undefined
      ? {}
      : {
          WFAskActionDefaultAnswer: compileTextToken(options.defaultAnswer, context),
        }),
  };
}

/**
 * 编译列表选择动作的输入和提示参数。
 */
function compileChooseFromListParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  const options = (node.params.options ?? {}) as {
    prompt?: unknown;
  };

  return {
    WFInput: compileInput(node.params.input, context),
    ...(options.prompt === undefined
      ? {}
      : {
          WFChooseFromListActionPrompt: compileTextToken(options.prompt, context),
        }),
  };
}

/**
 * 编译拆分文本动作的输入和分隔符参数。
 */
function compileSplitTextParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  const options = (node.params.options ?? {}) as {
    separator?: string;
  };

  return {
    "Show-text": true,
    text: compileInput(node.params.input, context),
    WFTextSeparator: options.separator ?? "New Lines",
  };
}

/**
 * 编译从列表取项目动作的输入、取值模式和范围起点参数。
 */
function compileGetItemFromListParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  const options = (node.params.options ?? {}) as {
    mode?: string;
    start?: unknown;
  };
  const mode = options.mode ?? "first";
  const parameters: Record<string, PlistValue> = {
    WFInput: compileInput(node.params.input, context),
    WFItemSpecifier: compileGetItemSpecifier(mode),
  };

  if (mode === "range") {
    if (options.start === undefined) {
      throw new Error("getItemFromList range mode requires a start option.");
    }

    parameters.WFItemRangeStart = compileParameterValue(options.start, context);
  }

  return parameters;
}

/**
 * 编译从列表取项目动作的取值模式字符串。
 */
function compileGetItemSpecifier(mode: string): string {
  switch (mode) {
    case "first":
      return "First Item";

    case "last":
      return "Last Item";

    case "random":
      return "Random Item";

    case "range":
      return "Items in Range";

    default:
      throw new Error(`Unsupported getItemFromList mode: ${mode}`);
  }
}

/**
 * 编译打开 App 动作的 bundle identifier 和选择 App 参数。
 */
function compileOpenAppParameters(node: ShortcutActionNode): Record<string, PlistValue> {
  const app = node.params.app as
    | string
    | {
        bundleIdentifier?: unknown;
        name?: unknown;
        teamIdentifier?: unknown;
      };
  const bundleIdentifier =
    typeof app === "string" ? app : String(app.bundleIdentifier ?? "");

  if (!bundleIdentifier) {
    throw new Error("openApp requires a bundleIdentifier.");
  }

  const name = typeof app === "string" ? bundleIdentifier : String(app.name ?? bundleIdentifier);
  const teamIdentifier =
    typeof app === "string" ? "0000000000" : String(app.teamIdentifier ?? "0000000000");

  return {
    WFAppIdentifier: bundleIdentifier,
    WFSelectedApp: {
      BundleIdentifier: bundleIdentifier,
      Name: name,
      TeamIdentifier: teamIdentifier,
    },
  };
}

/**
 * 编译获取 URL 内容动作的参数。
 */
function compileGetContentsOfURLParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  const options = (node.params.options ?? {}) as {
    method?: string;
    headers?: ShortcutDictionary;
  };

  return {
    WFURL: compileTextToken(node.params.input, context),
    ...(options.method
      ? {
          WFHTTPMethod: options.method,
        }
      : {}),
    ...(options.headers
      ? {
          WFHTTPHeaders: compileDictionary(options.headers),
          ShowHeaders: true,
        }
      : {}),
  };
}

/**
 * 编译普通对象为 Shortcuts 字典字段结构。
 */
function compileDictionary(value: ShortcutDictionary): PlistValue {
  return {
    Value: {
      WFDictionaryFieldValueItems: Object.entries(value).map(([key, item]) => ({
        WFItemType: dictionaryItemType(item),
        WFKey: dictionaryTextToken(key),
        WFValue: dictionaryValue(item),
      })),
    },
    WFSerializationType: "WFDictionaryFieldValue",
  };
}

/**
 * 判断字典值在 Shortcuts 中使用的基础类型编号。
 */
function dictionaryItemType(value: ShortcutDictionaryValue): number {
  if (Array.isArray(value)) {
    return 2;
  }

  if (value !== null && typeof value === "object") {
    return 1;
  }

  if (typeof value === "number") {
    return 3;
  }

  if (typeof value === "boolean") {
    return 0;
  }

  return 0;
}

/**
 * 编译字典字段中的文本 token。
 */
function dictionaryTextToken(value: string): PlistValue {
  return {
    Value: {
      string: value,
    },
    WFSerializationType: "WFTextTokenString",
  };
}

/**
 * 编译字典字段值。
 */
function dictionaryValue(value: ShortcutDictionaryValue): PlistValue {
  if (Array.isArray(value)) {
    return {
      Value: value.map((item) => String(item ?? "")),
      WFSerializationType: "WFArrayParameterState",
    };
  }

  if (value !== null && typeof value === "object") {
    return {
      Value: compileDictionary(value as ShortcutDictionary),
      WFSerializationType: "WFDictionaryFieldValue",
    };
  }

  return dictionaryTextToken(String(value ?? ""));
}
