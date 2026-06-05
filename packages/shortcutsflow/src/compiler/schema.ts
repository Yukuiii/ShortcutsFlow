import type { PlistValue } from "../plist/index.js";

export type WorkflowAction = {
  WFWorkflowActionIdentifier: string;
  WFWorkflowActionParameters: Record<string, PlistValue>;
};

export type WorkflowPlist = {
  WFWorkflowActions: WorkflowAction[];
  WFWorkflowClientVersion: string;
  WFWorkflowHasOutputFallback: boolean;
  WFWorkflowHasShortcutInputVariables: boolean;
  WFWorkflowIcon: {
    WFWorkflowIconGlyphNumber: number;
    WFWorkflowIconStartColor: number;
  };
  WFWorkflowImportQuestions: PlistValue[];
  WFWorkflowInputContentItemClasses: string[];
  WFWorkflowMinimumClientVersion: number;
  WFWorkflowMinimumClientVersionString: string;
  WFWorkflowOutputContentItemClasses: string[];
  WFWorkflowTypes: string[];
  WFQuickActionSurfaces: string[];
};

export type ActionSchema = {
  identifier: string;
  outputName?: string;
};

export const actionSchemas: Record<string, ActionSchema> = {
  comment: {
    identifier: "is.workflow.actions.comment",
  },
  appendVariable: {
    identifier: "is.workflow.actions.appendvariable",
  },
  askForInput: {
    identifier: "is.workflow.actions.ask",
    outputName: "提供的输入",
  },
  base64: {
    identifier: "is.workflow.actions.base64encode",
    outputName: "Base64已编码内容",
  },
  chooseFromList: {
    identifier: "is.workflow.actions.choosefromlist",
    outputName: "选取的项目",
  },
  delay: {
    identifier: "is.workflow.actions.delay",
  },
  detectDictionary: {
    identifier: "is.workflow.actions.detect.dictionary",
    outputName: "词典",
  },
  dictionary: {
    identifier: "is.workflow.actions.dictionary",
    outputName: "词典",
  },
  getContentsOfURL: {
    identifier: "is.workflow.actions.downloadurl",
    outputName: "URL的内容",
  },
  getItemFromList: {
    identifier: "is.workflow.actions.getitemfromlist",
    outputName: "来自列表的项目",
  },
  getDictionaryValue: {
    identifier: "is.workflow.actions.getvalueforkey",
    outputName: "词典值",
  },
  matchText: {
    identifier: "is.workflow.actions.text.match",
    outputName: "匹配",
  },
  notification: {
    identifier: "is.workflow.actions.notification",
  },
  openApp: {
    identifier: "is.workflow.actions.openapp",
  },
  openURL: {
    identifier: "is.workflow.actions.openurl",
  },
  replaceText: {
    identifier: "is.workflow.actions.text.replace",
    outputName: "更新后的文本",
  },
  setVariable: {
    identifier: "is.workflow.actions.setvariable",
  },
  showResult: {
    identifier: "is.workflow.actions.showresult",
  },
  splitText: {
    identifier: "is.workflow.actions.text.split",
    outputName: "拆分文本",
  },
  text: {
    identifier: "is.workflow.actions.gettext",
    outputName: "文本",
  },
  url: {
    identifier: "is.workflow.actions.url",
    outputName: "URL",
  },
};
