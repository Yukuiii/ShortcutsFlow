import type { PlistValue } from "@shortcutsflow/plist";

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
  base64: {
    identifier: "is.workflow.actions.base64encode",
    outputName: "Base64已编码内容",
  },
  dictionary: {
    identifier: "is.workflow.actions.dictionary",
    outputName: "词典",
  },
  getContentsOfURL: {
    identifier: "is.workflow.actions.downloadurl",
    outputName: "URL的内容",
  },
  getValueForKey: {
    identifier: "is.workflow.actions.getvalueforkey",
    outputName: "词典值",
  },
  notification: {
    identifier: "is.workflow.actions.notification",
  },
  openURL: {
    identifier: "is.workflow.actions.openurl",
  },
  setVariable: {
    identifier: "is.workflow.actions.setvariable",
  },
  showResult: {
    identifier: "is.workflow.actions.showresult",
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
