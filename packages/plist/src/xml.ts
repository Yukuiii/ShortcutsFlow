export type PlistValue =
  | string
  | number
  | boolean
  | null
  | Date
  | Uint8Array
  | PlistValue[]
  | {
      [key: string]: PlistValue;
    };

const header = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">`;

/**
 * 将 JavaScript 对象序列化为 Apple XML plist。
 */
export function serializePlist(value: PlistValue): string {
  return `${header}\n<plist version="1.0">\n${serializeValue(value, 1)}\n</plist>\n`;
}

/**
 * 转义 XML 文本节点中的特殊字符。
 */
function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * 转义 XML key 节点中的特殊字符。
 */
function escapeKey(value: string): string {
  return escapeXml(value).replaceAll('"', "&quot;");
}

/**
 * 序列化任意 plist 值。
 */
function serializeValue(value: PlistValue, depth: number): string {
  const indent = "\t".repeat(depth);

  if (value === null) {
    return `${indent}<string></string>`;
  }

  if (typeof value === "string") {
    return `${indent}<string>${escapeXml(value)}</string>`;
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? `${indent}<integer>${value}</integer>`
      : `${indent}<real>${value}</real>`;
  }

  if (typeof value === "boolean") {
    return `${indent}<${value ? "true" : "false"}/>`;
  }

  if (value instanceof Date) {
    return `${indent}<date>${value.toISOString()}</date>`;
  }

  if (value instanceof Uint8Array) {
    return `${indent}<data>${Buffer.from(value).toString("base64")}</data>`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${indent}<array/>`;
    }

    return [
      `${indent}<array>`,
      ...value.map((item) => serializeValue(item, depth + 1)),
      `${indent}</array>`,
    ].join("\n");
  }

  const entries = Object.entries(value).filter(([, item]) => item !== undefined);

  if (entries.length === 0) {
    return `${indent}<dict/>`;
  }

  return [
    `${indent}<dict>`,
    ...entries.flatMap(([key, item]) => [
      `${indent}\t<key>${escapeKey(key)}</key>`,
      serializeValue(item, depth + 1),
    ]),
    `${indent}</dict>`,
  ].join("\n");
}
