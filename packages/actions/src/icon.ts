import type { ShortcutIcon } from "@shortcutsflow/core";

export const shortcutIconColors = {
  red: "#ff3b30",
  orange: "#ff9500",
  yellow: "#ffcc00",
  green: "#34c759",
  mint: "#00c7be",
  teal: "#30b0c7",
  cyan: "#32ade6",
  blue: "#1b9af7",
  indigo: "#5856d6",
  purple: "#af52de",
  pink: "#ff2d55",
  gray: "#8e8e93",
} as const;

export const shortcutIconGlyphs = {
  shortcut: 59684,
} as const;

type RawIconColor = {
  kind: "color";
  raw: number;
};

type RawIconGlyph = {
  kind: "glyph";
  raw: number;
};

export type ShortcutIconColorName = keyof typeof shortcutIconColors;

export type ShortcutIconColorInput = ShortcutIconColorName | `#${string}` | RawIconColor;

export type ShortcutIconGlyphName = keyof typeof shortcutIconGlyphs;

export type ShortcutIconGlyphInput = ShortcutIconGlyphName | RawIconGlyph;

export type ShortcutIconInput = {
  color?: ShortcutIconColorInput;
  glyph?: ShortcutIconGlyphInput;
};

/**
 * 创建一个显式的 Shortcuts 图标颜色原始值。
 */
export function rawIconColor(value: number): RawIconColor {
  assertUnsignedInteger("Icon color", value);
  return {
    kind: "color",
    raw: value,
  };
}

/**
 * 创建一个显式的 Shortcuts 图标字形原始值。
 */
export function rawIconGlyph(value: number): RawIconGlyph {
  assertPositiveInteger("Icon glyph", value);
  return {
    kind: "glyph",
    raw: value,
  };
}

/**
 * 将开发者友好的图标配置解析成 Shortcuts plist 使用的内部编号。
 */
export function resolveShortcutIcon(icon: ShortcutIconInput | undefined): ShortcutIcon | undefined {
  if (!icon) {
    return undefined;
  }

  return {
    color: resolveIconColor(icon.color ?? "blue"),
    glyph: resolveIconGlyph(icon.glyph ?? "shortcut"),
  };
}

/**
 * 解析 Shortcuts 图标颜色输入。
 */
function resolveIconColor(color: ShortcutIconColorInput): number {
  if (typeof color === "object") {
    if (color.kind !== "color") {
      throw new Error("Icon color must be created with rawIconColor(...).");
    }

    return color.raw;
  }

  const colorValue = shortcutIconColors[color as ShortcutIconColorName] ?? color;

  return parseHexColor(colorValue);
}

/**
 * 解析 Shortcuts 图标字形输入。
 */
function resolveIconGlyph(glyph: ShortcutIconGlyphInput): number {
  if (typeof glyph === "object") {
    if (glyph.kind !== "glyph") {
      throw new Error("Icon glyph must be created with rawIconGlyph(...).");
    }

    return glyph.raw;
  }

  const glyphValue = shortcutIconGlyphs[glyph as ShortcutIconGlyphName];

  if (glyphValue === undefined) {
    throw new Error(`Invalid icon glyph: ${glyph}`);
  }

  return glyphValue;
}

/**
 * 将 #RRGGBB 或 #RRGGBBAA 颜色转换为 Shortcuts 使用的 RGBA 整数。
 */
function parseHexColor(value: string): number {
  const hex = value.startsWith("#") ? value.slice(1) : value;

  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(hex)) {
    throw new Error(`Invalid icon color: ${value}`);
  }

  return Number.parseInt(hex.length === 6 ? `${hex}ff` : hex, 16);
}

/**
 * 校验一个非负整数原始值。
 */
function assertUnsignedInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
}

/**
 * 校验一个正整数原始值。
 */
function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}
