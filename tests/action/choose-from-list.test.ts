import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertActionOutputAttachment, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("chooseFromList 支持字面量输入且可省略提示", () => {
  const actions = compileActions(defineShortcut({
    name: "Choose From List Minimal",
    workflow: (shortcut) => {
      shortcut.chooseFromList("dev,prod");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.choosefromlist");

  assert.equal(parameters.WFInput, "dev,prod");
  assert.equal("WFChooseFromListActionPrompt" in parameters, false);
  assertUuid(parameters);
});

test("chooseFromList 支持上游输出输入和提示", () => {
  const actions = compileActions(defineShortcut({
    name: "Choose From List Output",
    workflow: (shortcut) => {
      const items = shortcut.text("dev,prod");
      shortcut.chooseFromList(items, {
        prompt: "选择环境",
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.choosefromlist");

  assertActionOutputAttachment(parameters.WFInput, "文本");
  assert.equal(parameters.WFChooseFromListActionPrompt, "选择环境");
});
