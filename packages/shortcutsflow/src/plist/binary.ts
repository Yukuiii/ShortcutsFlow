import { buildBinary } from "plist";
import type { PlistValue } from "./xml.js";

/**
 * 将 JavaScript 对象序列化为 Apple binary plist。
 */
export function serializeBinaryPlist(value: PlistValue): Uint8Array {
  return buildBinary(normalizePlistValue(value));
}

/**
 * 规范化 plist 值以匹配现有 XML 序列化语义。
 */
function normalizePlistValue(value: PlistValue): PlistValue {
  if (value === null) {
    return "";
  }

  if (value instanceof Date || value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizePlistValue);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, normalizePlistValue(item)]),
    ) as PlistValue;
  }

  return value;
}
