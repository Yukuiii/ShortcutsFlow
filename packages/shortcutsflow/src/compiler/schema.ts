import type { PlistValue } from "../plist/index.js";
import { actionCompilers } from "./action-compilers.js";

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

export const actionSchemas: Record<string, ActionSchema> = Object.fromEntries(
  Object.entries(actionCompilers).map(([action, compiler]) => [
    action,
    {
      identifier: compiler.identifier,
      ...(compiler.outputName
        ? {
            outputName: compiler.outputName,
          }
        : {}),
    },
  ]),
);
