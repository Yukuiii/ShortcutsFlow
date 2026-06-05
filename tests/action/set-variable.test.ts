import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import {
  assertActionOutputAttachment,
  assertVariableAttachment,
  compileActions,
  paramsFor,
} from "./helpers.js";

test("setVariable 支持只创建空变量", () => {
  const actions = compileActions(defineShortcut({
    name: "Set Empty Variable",
    workflow: (shortcut) => {
      const value = shortcut.setVariable("Message");
      shortcut.showResult(value);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.setvariable");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(parameters.WFVariableName, "Message");
  assert.equal("WFInput" in parameters, false);
  assert.equal("UUID" in parameters, false);
  assertVariableAttachment(showResult.WFInput, "Message");
});

test("setVariable 支持把上游 action 输出写入命名变量", () => {
  const actions = compileActions(defineShortcut({
    name: "Set Variable From Output",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.setVariable("Message", message);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.setvariable");

  assert.equal(parameters.WFVariableName, "Message");
  assertActionOutputAttachment(parameters.WFInput, "文本");
});
