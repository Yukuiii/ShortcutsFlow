import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { assertActionOutputAttachment, compileActions, paramsFor } from "./helpers.js";

test("showResult 支持字面量输入", () => {
  const actions = compileActions(defineShortcut({
    name: "Show Result Literal",
    workflow: (shortcut) => {
      shortcut.showResult("Build complete");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(parameters.WFInput, "Build complete");
  assert.equal("UUID" in parameters, false);
});

test("showResult 支持上游 action 输出输入", () => {
  const actions = compileActions(defineShortcut({
    name: "Show Result Output",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.showResult(message);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.showresult");

  assertActionOutputAttachment(parameters.WFInput, "文本");
});
