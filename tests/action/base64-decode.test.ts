import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertActionOutputAttachment, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("base64Decode 编译为 Decode mode", () => {
  const actions = compileActions(defineShortcut({
    name: "Base64 Decode",
    workflow: (shortcut) => {
      const encoded = shortcut.text("SGVsbG8=");
      shortcut.base64Decode(encoded);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.base64encode");

  assertActionOutputAttachment(parameters.WFInput, "文本");
  assert.equal(parameters.WFEncodeMode, "Decode");
  assertUuid(parameters);
});
