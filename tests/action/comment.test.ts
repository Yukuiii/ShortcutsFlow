import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertTextTokenActionOutput, compileActions, paramsFor } from "./helpers.js";

test("comment 编译为 Shortcuts Comment action", () => {
  const actions = compileActions(defineShortcut({
    name: "Comment",
    workflow: (shortcut) => {
      shortcut.comment("Generated from TypeScript.");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.comment");

  assert.equal(parameters.WFCommentActionText, "Generated from TypeScript.");
  assert.equal("UUID" in parameters, false);
});

test("comment 支持上游 action 输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Comment Output",
    workflow: (shortcut) => {
      const message = shortcut.text("Generated from TypeScript.");

      shortcut.comment(message);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.comment");

  assertTextTokenActionOutput(parameters.WFCommentActionText, "文本");
  assert.equal("UUID" in parameters, false);
});
