export type ShortcutPrimitive = string | number | boolean | null;

export type ShortcutDictionaryValue =
  | ShortcutPrimitive
  | ShortcutDictionary
  | ShortcutDictionaryValue[];

export interface ShortcutDictionary {
  [key: string]: ShortcutDictionaryValue;
}

export type ShortcutIcon = {
  color: number;
  glyph: number;
};

export type ShortcutValueKind = "literal" | "variable" | "action-output";

export type ShortcutValue<T = unknown> = {
  kind: ShortcutValueKind;
  valueType?: string;
  value: T;
};

export type ShortcutConditionOperator = "exists" | "equals";

export type ShortcutCondition = {
  kind: "condition";
  operator: ShortcutConditionOperator;
  left: unknown;
  right?: unknown;
};

export type ShortcutActionNode = {
  kind: "action";
  action: string;
  params: Record<string, unknown>;
  outputName?: string;
};

export type ShortcutIfNode = {
  kind: "if";
  condition: ShortcutCondition;
  then: ShortcutNode[];
  otherwise?: ShortcutNode[];
};

export type ShortcutRepeatEachNode = {
  kind: "repeatEach";
  input: unknown;
  body: ShortcutNode[];
};

export type ShortcutMenuNode = {
  kind: "menu";
  prompt: string;
  items: Array<{
    title: string;
    body: ShortcutNode[];
  }>;
};

export type ShortcutNode =
  | ShortcutActionNode
  | ShortcutIfNode
  | ShortcutRepeatEachNode
  | ShortcutMenuNode;

export type ShortcutDefinition = {
  name: string;
  icon?: ShortcutIcon;
  workflow: () => ShortcutNode[];
};

export type ResolvedShortcut = {
  name: string;
  icon: ShortcutIcon;
  nodes: ShortcutNode[];
};
