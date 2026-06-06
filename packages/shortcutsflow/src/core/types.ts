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

export type ShortcutConditionOperator =
  | "equals"
  | "notEquals"
  | "exists"
  | "doesNotExist"
  | "contains"
  | "doesNotContain"
  | "beginsWith"
  | "endsWith";

export type ShortcutSingleCondition = {
  kind: "condition";
  operator: ShortcutConditionOperator;
  left: unknown;
  right?: unknown;
};

export type ShortcutConditionGroupMode = "all" | "any";

export type ShortcutConditionGroup = {
  kind: "condition-group";
  mode: ShortcutConditionGroupMode;
  conditions: ShortcutSingleCondition[];
};

export type ShortcutCondition = ShortcutSingleCondition | ShortcutConditionGroup;

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
  outputName?: string;
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
