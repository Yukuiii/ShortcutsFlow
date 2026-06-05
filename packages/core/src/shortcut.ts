import type { ShortcutDefinition, ShortcutIcon, ResolvedShortcut } from "./types.js";

const defaultIcon: ShortcutIcon = {
  color: 463140863,
  glyph: 59684,
};

/**
 * 定义一个可由编译器转换为 Apple Shortcuts workflow 的快捷指令入口。
 */
export function defineShortcut(definition: ShortcutDefinition): ShortcutDefinition {
  return definition;
}

/**
 * 解析快捷指令定义并补齐编译所需的默认元数据。
 */
export function resolveShortcut(definition: ShortcutDefinition): ResolvedShortcut {
  return {
    name: definition.name,
    icon: definition.icon ?? defaultIcon,
    nodes: definition.workflow(),
  };
}
