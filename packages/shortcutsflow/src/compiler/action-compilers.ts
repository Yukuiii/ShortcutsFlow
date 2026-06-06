import type { ShortcutActionNode, ShortcutDictionary } from "../core/types.js";
import type { PlistValue } from "../plist/index.js";
import type { CompileContext } from "./context.js";
import { compileDictionary } from "./dictionary.js";
import { compileInput, compileParameterValue, compileTextToken } from "./values.js";

type ActionParameterCompiler = (
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
) => Record<string, PlistValue>;

export type ActionCompiler = {
  identifier: string;
  outputName?: string;
  compile: ActionParameterCompiler;
};

export const actionCompilers: Record<string, ActionCompiler> = {
  comment: {
    identifier: "is.workflow.actions.comment",
    compile: compileCommentParameters,
  },
  appendVariable: {
    identifier: "is.workflow.actions.appendvariable",
    compile: compileAppendVariableParameters,
  },
  askForInput: {
    identifier: "is.workflow.actions.ask",
    outputName: "提供的输入",
    compile: compileAskForInputActionParameters,
  },
  base64: {
    identifier: "is.workflow.actions.base64encode",
    outputName: "Base64已编码内容",
    compile: compileBase64Parameters,
  },
  chooseFromList: {
    identifier: "is.workflow.actions.choosefromlist",
    outputName: "选取的项目",
    compile: compileChooseFromListActionParameters,
  },
  delay: {
    identifier: "is.workflow.actions.delay",
    compile: compileDelayParameters,
  },
  detectDictionary: {
    identifier: "is.workflow.actions.detect.dictionary",
    outputName: "词典",
    compile: compileDetectDictionaryParameters,
  },
  dictionary: {
    identifier: "is.workflow.actions.dictionary",
    outputName: "词典",
    compile: compileDictionaryActionParameters,
  },
  getContentsOfURL: {
    identifier: "is.workflow.actions.downloadurl",
    outputName: "URL的内容",
    compile: compileGetContentsOfURLActionParameters,
  },
  getItemFromList: {
    identifier: "is.workflow.actions.getitemfromlist",
    outputName: "来自列表的项目",
    compile: compileGetItemFromListActionParameters,
  },
  getDictionaryValue: {
    identifier: "is.workflow.actions.getvalueforkey",
    outputName: "词典值",
    compile: compileGetDictionaryValueParameters,
  },
  matchText: {
    identifier: "is.workflow.actions.text.match",
    outputName: "匹配",
    compile: compileMatchTextParameters,
  },
  notification: {
    identifier: "is.workflow.actions.notification",
    compile: compileNotificationParameters,
  },
  openApp: {
    identifier: "is.workflow.actions.openapp",
    compile: compileOpenAppParameters,
  },
  openURL: {
    identifier: "is.workflow.actions.openurl",
    compile: compileOpenURLParameters,
  },
  replaceText: {
    identifier: "is.workflow.actions.text.replace",
    outputName: "更新后的文本",
    compile: compileReplaceTextParameters,
  },
  setVariable: {
    identifier: "is.workflow.actions.setvariable",
    compile: compileSetVariableParameters,
  },
  showResult: {
    identifier: "is.workflow.actions.showresult",
    compile: compileShowResultParameters,
  },
  showAlert: {
    identifier: "is.workflow.actions.alert",
    compile: compileShowAlertParameters,
  },
  splitText: {
    identifier: "is.workflow.actions.text.split",
    outputName: "拆分文本",
    compile: compileSplitTextActionParameters,
  },
  text: {
    identifier: "is.workflow.actions.gettext",
    outputName: "文本",
    compile: compileTextParameters,
  },
  url: {
    identifier: "is.workflow.actions.url",
    outputName: "URL",
    compile: compileUrlParameters,
  },
};

/**
 * 按 DSL action 名称读取 action 编译器。
 */
export function getActionCompiler(action: string): ActionCompiler | undefined {
  return actionCompilers[action];
}

/**
 * 编译 Comment 动作参数。
 */
function compileCommentParameters(node: ShortcutActionNode): Record<string, PlistValue> {
  return {
    WFCommentActionText: String(node.params.text ?? ""),
  };
}

/**
 * 编译 Add to Variable 动作参数。
 */
function compileAppendVariableParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  return {
    WFInput: compileInput(node.params.input, context),
    WFVariableName: String(node.params.name ?? ""),
  };
}

/**
 * 编译 Ask for Input 动作参数。
 */
function compileAskForInputActionParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, compileAskForInputParameters(node, context));
}

/**
 * 编译 Base64 Encode/Decode 动作参数。
 */
function compileBase64Parameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFInput: compileInput(node.params.input, context),
    WFEncodeMode: String(node.params.mode ?? "Encode"),
  });
}

/**
 * 编译 Choose from List 动作参数。
 */
function compileChooseFromListActionParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, compileChooseFromListParameters(node, context));
}

/**
 * 编译 Delay 动作参数。
 */
function compileDelayParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  return {
    WFDelayTime: compileParameterValue(node.params.seconds, context),
  };
}

/**
 * 编译 Detect Dictionary 动作参数。
 */
function compileDetectDictionaryParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFInput: compileInput(node.params.input, context),
  });
}

/**
 * 编译 Dictionary 动作参数。
 */
function compileDictionaryActionParameters(
  node: ShortcutActionNode,
  _context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFItems: compileDictionary(node.params.value as ShortcutDictionary),
  });
}

/**
 * 编译 Get Contents of URL 动作参数。
 */
function compileGetContentsOfURLActionParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, compileGetContentsOfURLParameters(node, context));
}

/**
 * 编译 Get Item from List 动作参数。
 */
function compileGetItemFromListActionParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, compileGetItemFromListParameters(node, context));
}

/**
 * 编译 Get Dictionary Value 动作参数。
 */
function compileGetDictionaryValueParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFInput: compileInput(node.params.input, context),
    WFDictionaryKey: compileTextToken(node.params.key, context),
  });
}

/**
 * 编译 Match Text 动作参数。
 */
function compileMatchTextParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    text: compileTextToken(node.params.input, context),
    WFMatchTextPattern: compileTextToken(node.params.pattern, context),
  });
}

/**
 * 编译 Show Notification 动作参数。
 */
function compileNotificationParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  return {
    WFNotificationActionTitle: compileTextToken(node.params.title, context),
    ...(node.params.body === undefined
      ? {}
      : {
          WFNotificationActionBody: compileTextToken(node.params.body, context),
        }),
  };
}

/**
 * 编译 Open URL 动作参数。
 */
function compileOpenURLParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  return {
    WFInput: compileInput(node.params.input, context),
    "Show-WFInput": true,
  };
}

/**
 * 编译 Replace Text 动作参数。
 */
function compileReplaceTextParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFInput: compileTextToken(node.params.input, context),
    WFReplaceTextFind: compileTextToken(node.params.find, context),
    WFReplaceTextReplace: compileTextToken(node.params.replace, context),
  });
}

/**
 * 编译 Set Variable 动作参数。
 */
function compileSetVariableParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  return {
    ...(node.params.input === undefined
      ? {}
      : {
          WFInput: compileInput(node.params.input, context),
        }),
    WFVariableName: String(node.params.name ?? ""),
  };
}

/**
 * 编译 Show Result 动作参数。
 */
function compileShowResultParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  return {
    Text: compileTextToken(node.params.input, context),
  };
}

/**
 * 编译 Show Alert 动作参数。
 */
function compileShowAlertParameters(
  node: ShortcutActionNode,
  context: CompileContext,
): Record<string, PlistValue> {
  const options = (node.params.options ?? {}) as {
    showCancelButton?: boolean;
  };

  return {
    WFAlertActionTitle: compileTextToken(node.params.title, context),
    WFAlertActionMessage: compileTextToken(node.params.message, context),
    ...(options.showCancelButton === undefined
      ? {}
      : {
          WFAlertActionCancelButtonShown: options.showCancelButton,
        }),
  };
}

/**
 * 编译 Split Text 动作参数。
 */
function compileSplitTextActionParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, compileSplitTextParameters(node, context));
}

/**
 * 编译 Text 动作参数。
 */
function compileTextParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFTextActionText: compileTextToken(node.params.value, context),
  });
}

/**
 * 编译 URL 动作参数。
 */
function compileUrlParameters(
  node: ShortcutActionNode,
  context: CompileContext,
  uuid?: string,
): Record<string, PlistValue> {
  return withUuid(uuid, {
    WFURLActionURL: compileTextToken(node.params.value, context),
  });
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
  const app = node.params.app;

  if (typeof app !== "string" && (app === null || typeof app !== "object")) {
    throw new Error("openApp requires a bundleIdentifier.");
  }

  const appConfig = app as string | {
    bundleIdentifier?: unknown;
    name?: unknown;
    teamIdentifier?: unknown;
  };
  const bundleIdentifier =
    typeof appConfig === "string" ? appConfig : String(appConfig.bundleIdentifier ?? "");

  if (!bundleIdentifier) {
    throw new Error("openApp requires a bundleIdentifier.");
  }

  const name = typeof appConfig === "string" ? bundleIdentifier : String(appConfig.name ?? bundleIdentifier);
  const teamIdentifier =
    typeof appConfig === "string" ? "0000000000" : String(appConfig.teamIdentifier ?? "0000000000");

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
