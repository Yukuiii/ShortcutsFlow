import type { ShortcutDictionary, ShortcutDictionaryValue } from "../core/types.js";
import type { PlistValue } from "../plist/index.js";

/**
 * 编译普通对象为 Shortcuts 字典字段结构。
 */
export function compileDictionary(value: ShortcutDictionary): PlistValue {
  return {
    Value: {
      WFDictionaryFieldValueItems: Object.entries(value).map(([key, item]) => ({
        WFItemType: dictionaryItemType(item),
        WFKey: dictionaryTextToken(key),
        WFValue: dictionaryValue(item),
      })),
    },
    WFSerializationType: "WFDictionaryFieldValue",
  };
}

/**
 * 判断字典值在 Shortcuts 中使用的基础类型编号。
 */
function dictionaryItemType(value: ShortcutDictionaryValue): number {
  if (Array.isArray(value)) {
    return 2;
  }

  if (value !== null && typeof value === "object") {
    return 1;
  }

  if (typeof value === "number") {
    return 3;
  }

  if (typeof value === "boolean") {
    return 0;
  }

  return 0;
}

/**
 * 编译字典字段中的文本 token。
 */
function dictionaryTextToken(value: string): PlistValue {
  return {
    Value: {
      string: value,
    },
    WFSerializationType: "WFTextTokenString",
  };
}

/**
 * 编译字典字段值。
 */
function dictionaryValue(value: ShortcutDictionaryValue): PlistValue {
  if (Array.isArray(value)) {
    return {
      Value: value.map((item) => String(item ?? "")),
      WFSerializationType: "WFArrayParameterState",
    };
  }

  if (value !== null && typeof value === "object") {
    return {
      Value: compileDictionary(value as ShortcutDictionary),
      WFSerializationType: "WFDictionaryFieldValue",
    };
  }

  return dictionaryTextToken(String(value ?? ""));
}
