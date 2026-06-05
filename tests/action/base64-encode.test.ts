import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertUuid, compileActions, paramsFor } from "./helpers.js";

test("base64Encode 编译为 Encode mode", () => {
  const actions = compileActions(defineShortcut({
    name: "Base64 Encode",
    workflow: (shortcut) => {
      shortcut.base64Encode("Hello");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.base64encode");

  assert.equal(parameters.WFInput, "Hello");
  assert.equal(parameters.WFEncodeMode, "Encode");
  assertUuid(parameters);
});
