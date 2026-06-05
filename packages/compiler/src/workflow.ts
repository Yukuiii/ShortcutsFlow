import type { ResolvedShortcut } from "@shortcutsflow/core";
import type { WorkflowPlist } from "./schema.js";

const defaultContentItemClasses = [
  "WFStringContentItem",
  "WFNumberContentItem",
  "WFBooleanContentItem",
  "WFDictionaryContentItem",
  "WFURLContentItem",
  "WFContentItem",
];

/**
 * 创建 Shortcuts workflow 的顶层 plist 结构。
 */
export function createWorkflowPlist(
  shortcut: ResolvedShortcut,
  actions: WorkflowPlist["WFWorkflowActions"],
): WorkflowPlist {
  return {
    WFQuickActionSurfaces: [],
    WFWorkflowActions: actions,
    WFWorkflowClientVersion: "2038.0.1.10",
    WFWorkflowHasOutputFallback: false,
    WFWorkflowHasShortcutInputVariables: false,
    WFWorkflowIcon: {
      WFWorkflowIconGlyphNumber: shortcut.icon.glyph,
      WFWorkflowIconStartColor: shortcut.icon.color,
    },
    WFWorkflowImportQuestions: [],
    WFWorkflowInputContentItemClasses: [],
    WFWorkflowMinimumClientVersion: 1106,
    WFWorkflowMinimumClientVersionString: "1106",
    WFWorkflowOutputContentItemClasses: defaultContentItemClasses,
    WFWorkflowTypes: [],
  };
}
