import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { asArray, asRecord, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("dictionary 编译基础类型、数组和嵌套对象", () => {
  const actions = compileActions(defineShortcut({
    name: "Dictionary",
    workflow: (shortcut) => {
      shortcut.dictionary({
        env: "dev",
        retries: 3,
        enabled: true,
        tags: ["alpha", "beta"],
        nested: {
          endpoint: "https://example.com",
        },
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.dictionary");
  const items = asRecord(parameters.WFItems, "WFItems should be a dictionary field value");
  const value = asRecord(items.Value, "WFItems.Value should be an object");
  const fieldItems = asArray<Record<string, unknown>>(
    value.WFDictionaryFieldValueItems,
    "dictionary items should be an array",
  );

  assertUuid(parameters);
  assert.deepEqual(fieldItems.map((item) => asRecord(item.WFKey, "key").Value), [
    { string: "env" },
    { string: "retries" },
    { string: "enabled" },
    { string: "tags" },
    { string: "nested" },
  ]);
  assert.deepEqual(fieldItems.map((item) => item.WFItemType), [0, 3, 0, 2, 1]);
});
