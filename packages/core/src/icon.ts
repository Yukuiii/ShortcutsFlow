import type { ShortcutIcon } from "./types.js";
import { shortcutIconColorValues, shortcutIconGlyphValues } from "./icon-data.js";

export type ShortcutIconColor = {
  kind: "color";
  raw: number;
  name?: string;
};

export type ShortcutIconGlyph = {
  kind: "glyph";
  raw: number;
  name?: string;
};

export type ShortcutIconColorName = keyof typeof shortcutIconColorValues;

export type ShortcutIconColorInput = ShortcutIconColorName | `#${string}` | ShortcutIconColor;

export type ShortcutIconGlyphName = keyof typeof shortcutIconGlyphValues;

export type ShortcutIconGlyphInput = ShortcutIconGlyphName | ShortcutIconGlyph;

export type ShortcutIconInput = {
  color?: ShortcutIconColorInput;
  glyph?: ShortcutIconGlyphInput;
};

type ShortcutIconColorMap = {
  readonly [Name in ShortcutIconColorName]: ShortcutIconColor;
};

type ShortcutIconGlyphMap = {
  readonly [Name in ShortcutIconGlyphName]: ShortcutIconGlyph;
};

export const shortcutIconColors = createIconColorMap();

export const shortcutIconGlyphs = createIconGlyphMap();

export const icon = {
  color: shortcutIconColors,
  glyph: shortcutIconGlyphs,
  create,
  rawColor: rawIconColor,
  rawGlyph: rawIconGlyph,
} as const;

/**
 * 创建一个开发者可直接传入 defineShortcut 的快捷指令图标配置。
 */
export function create(
  color: ShortcutIconColorInput = shortcutIconColors.blue,
  glyph: ShortcutIconGlyphInput = shortcutIconGlyphs.shortcuts,
): ShortcutIconInput {
  return {
    color,
    glyph,
  };
}

/**
 * 创建一个显式的 Shortcuts 图标颜色原始值。
 */
export function rawIconColor(value: number): ShortcutIconColor {
  assertUnsignedInteger("Icon color", value);
  return {
    kind: "color",
    raw: value,
  };
}

/**
 * 创建一个显式的 Shortcuts 图标字形原始值。
 */
export function rawIconGlyph(value: number): ShortcutIconGlyph {
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
    glyph: resolveIconGlyph(icon.glyph ?? "shortcuts"),
  };
}

/**
 * 创建带类型标记的颜色映射。
 */
function createIconColorMap(): ShortcutIconColorMap {
  return Object.fromEntries(
    Object.entries(shortcutIconColorValues).map(([name, raw]) => [
      name,
      {
        kind: "color",
        name,
        raw,
      },
    ]),
  ) as ShortcutIconColorMap;
}

/**
 * 创建带类型标记的字形映射。
 */
function createIconGlyphMap(): ShortcutIconGlyphMap {
  return Object.fromEntries(
    Object.entries(shortcutIconGlyphValues).map(([name, raw]) => [
      name,
      {
        kind: "glyph",
        name,
        raw,
      },
    ]),
  ) as ShortcutIconGlyphMap;
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

  if (color.startsWith("#")) {
    return parseHexColor(color);
  }

  const colorValue = shortcutIconColorValues[color as ShortcutIconColorName];

  if (colorValue === undefined) {
    throw new Error(`Invalid icon color: ${color}`);
  }

  return colorValue;
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

  const glyphValue = shortcutIconGlyphValues[glyph as ShortcutIconGlyphName];

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
