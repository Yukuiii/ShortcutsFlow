import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { compileActions, paramsFor } from "./helpers.js";

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
