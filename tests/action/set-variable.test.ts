import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import {
  actionsWithIdentifier,
  assertActionOutputAttachment,
  assertTextTokenVariable,
  compileActions,
  params,
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
  assertTextTokenVariable(showResult.Text, "Message");
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

test("variable 初始化命名变量并返回可引用变量", () => {
  const actions = compileActions(defineShortcut({
    name: "Variable Initializer",
    workflow: (shortcut) => {
      const message = shortcut.variable("Message", "Hello");
      shortcut.showResult(message);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.setvariable");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(parameters.WFVariableName, "Message");
  assert.equal(parameters.WFInput, "Hello");
  assertTextTokenVariable(showResult.Text, "Message");
});

test("variable 支持链式 set 和 append 维护同一个命名变量", () => {
  const actions = compileActions(defineShortcut({
    name: "Variable Chain",
    workflow: (shortcut) => {
      const message = shortcut.variable("Message", "Hello");

      message.set("Updated");
      message.append("Tail");
      shortcut.showResult(message);
    },
  }));
  const setVariables = actionsWithIdentifier(actions, "is.workflow.actions.setvariable");
  const append = paramsFor(actions, "is.workflow.actions.appendvariable");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(setVariables.length, 2);

  const initialSet = params(setVariables[0] as never);
  const updatedSet = params(setVariables[1] as never);

  assert.equal(initialSet.WFVariableName, "Message");
  assert.equal(initialSet.WFInput, "Hello");
  assert.equal(updatedSet.WFVariableName, "Message");
  assert.equal(updatedSet.WFInput, "Updated");
  assert.equal(append.WFVariableName, "Message");
  assert.equal(append.WFInput, "Tail");
  assertTextTokenVariable(showResult.Text, "Message");
});
