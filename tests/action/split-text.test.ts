import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertActionOutputAttachment, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("splitText 默认使用 New Lines 分隔符", () => {
  const actions = compileActions(defineShortcut({
    name: "Split Text Default",
    workflow: (shortcut) => {
      shortcut.splitText("one\ntwo");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.text.split");

  assert.equal(parameters.text, "one\ntwo");
  assert.equal(parameters["Show-text"], true);
  assert.equal(parameters.WFTextSeparator, "New Lines");
  assertUuid(parameters);
});

test("splitText 支持上游输出输入和指定分隔符", () => {
  const actions = compileActions(defineShortcut({
    name: "Split Text Options",
    workflow: (shortcut) => {
      const text = shortcut.text("one two");
      shortcut.splitText(text, {
        separator: "Spaces",
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.text.split");

  assertActionOutputAttachment(parameters.text, "文本");
  assert.equal(parameters.WFTextSeparator, "Spaces");
});
