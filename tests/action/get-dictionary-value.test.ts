import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import {
  assertActionOutputAttachment,
  assertTextTokenActionOutput,
  assertUuid,
  compileActions,
  paramsFor,
} from "./helpers.js";

test("getDictionaryValue 从字典输出读取字面量 key", () => {
  const actions = compileActions(defineShortcut({
    name: "Get Dictionary Value Literal",
    workflow: (shortcut) => {
      const config = shortcut.dictionary({
        endpoint: "https://example.com",
      });
      shortcut.getDictionaryValue(config, "endpoint");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.getvalueforkey");

  assertActionOutputAttachment(parameters.WFInput, "词典");
  assert.equal(parameters.WFDictionaryKey, "endpoint");
  assertUuid(parameters);
});

test("getDictionaryValue 支持 key 引用上游 action 输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Get Dictionary Value Output",
    workflow: (shortcut) => {
      const config = shortcut.dictionary({
        endpoint: "https://example.com",
      });
      const key = shortcut.text("endpoint");
      shortcut.getDictionaryValue(config, key);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.getvalueforkey");

  assertActionOutputAttachment(parameters.WFInput, "词典");
  assertTextTokenActionOutput(parameters.WFDictionaryKey, "文本");
});
