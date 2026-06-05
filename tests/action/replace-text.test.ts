import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { assertTextTokenActionOutput, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("replaceText 支持字面量输入、查找值和替换值", () => {
  const actions = compileActions(defineShortcut({
    name: "Replace Text Literal",
    workflow: (shortcut) => {
      shortcut.replaceText("hello world", "world", "ShortcutsFlow");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.text.replace");

  assert.equal(parameters.WFInput, "hello world");
  assert.equal(parameters.WFReplaceTextFind, "world");
  assert.equal(parameters.WFReplaceTextReplace, "ShortcutsFlow");
  assertUuid(parameters);
});

test("replaceText 支持输入、查找值和替换值引用上游输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Replace Text Output",
    workflow: (shortcut) => {
      const input = shortcut.text("hello world");
      const find = shortcut.text("world");
      const replace = shortcut.text("ShortcutsFlow");
      shortcut.replaceText(input, find, replace);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.text.replace");

  assertTextTokenActionOutput(parameters.WFInput, "文本");
  assertTextTokenActionOutput(parameters.WFReplaceTextFind, "文本");
  assertTextTokenActionOutput(parameters.WFReplaceTextReplace, "文本");
});
