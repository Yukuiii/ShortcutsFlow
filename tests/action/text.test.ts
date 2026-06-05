import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertTextTokenActionOutput, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("text 编译为 Shortcuts Text action 并产生可引用输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Text",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello from TypeScript");
      shortcut.showResult(message);
    },
  }));
  const text = paramsFor(actions, "is.workflow.actions.gettext");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(text.WFTextActionText, "Hello from TypeScript");
  assertUuid(text);
  assertTextTokenActionOutput(showResult.Text, "文本");
});
