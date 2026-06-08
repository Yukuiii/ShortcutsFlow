import { strict as assert } from "node:assert";
import test from "node:test";
import { parseBinary } from "plist";
import { serializeBinaryPlist } from "../packages/shortcutsflow/src/plist/index.ts";

/**
 * 断言值是普通对象并返回该对象。
 */
function asRecord(value: unknown): Record<string, unknown> {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);
  assert.equal(Array.isArray(value), false);
  return value as Record<string, unknown>;
}

test("serializeBinaryPlist 生成可回读的 bplist00 数据", () => {
  const data = serializeBinaryPlist({
    title: "Shortcut",
    count: 2,
    enabled: true,
    empty: null,
    nested: {
      value: "ok",
      ignored: undefined,
    },
  });

  assert.equal(Buffer.from(data.subarray(0, 8)).toString("ascii"), "bplist00");
  assert.deepEqual(asRecord(parseBinary(data)), {
    title: "Shortcut",
    count: 2,
    enabled: true,
    empty: "",
    nested: {
      value: "ok",
    },
  });
});
