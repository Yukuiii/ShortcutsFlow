import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { assertTextTokenActionOutput, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("matchText 支持字面量输入和正则表达式", () => {
  const actions = compileActions(defineShortcut({
    name: "Match Text Literal",
    workflow: (shortcut) => {
      shortcut.matchText("Cookie: abc", "Cookie: (.+)");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.text.match");

  assert.equal(parameters.text, "Cookie: abc");
  assert.equal(parameters.WFMatchTextPattern, "Cookie: (.+)");
  assertUuid(parameters);
});

test("matchText 支持输入和 pattern 引用上游输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Match Text Output",
    workflow: (shortcut) => {
      const input = shortcut.text("Cookie: abc");
      const pattern = shortcut.text("Cookie: (.+)");
      shortcut.matchText(input, pattern);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.text.match");

  assertTextTokenActionOutput(parameters.text, "文本");
  assertTextTokenActionOutput(parameters.WFMatchTextPattern, "文本");
});
