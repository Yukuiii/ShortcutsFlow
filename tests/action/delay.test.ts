import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { assertVariableAttachment, compileActions, paramsFor } from "./helpers.js";

test("delay 支持数字秒数字面量", () => {
  const actions = compileActions(defineShortcut({
    name: "Delay Literal",
    workflow: (shortcut) => {
      shortcut.delay(3);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.delay");

  assert.equal(parameters.WFDelayTime, 3);
});

test("delay 支持运行期变量秒数", () => {
  const actions = compileActions(defineShortcut({
    name: "Delay Variable",
    workflow: (shortcut) => {
      const seconds = shortcut.setVariable("Seconds", 3);
      shortcut.delay(seconds);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.delay");

  assertVariableAttachment(parameters.WFDelayTime, "Seconds");
});
