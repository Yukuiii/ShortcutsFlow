import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import {
  assertActionOutputAttachment,
  assertTextTokenVariable,
  compileActions,
  paramsFor,
} from "./helpers.js";

test("appendVariable 支持字面量输入并返回命名变量引用", () => {
  const actions = compileActions(defineShortcut({
    name: "Append Variable Literal",
    workflow: (shortcut) => {
      const items = shortcut.appendVariable("Items", "Task");
      shortcut.showResult(items);
    },
  }));
  const append = paramsFor(actions, "is.workflow.actions.appendvariable");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(append.WFInput, "Task");
  assert.equal(append.WFVariableName, "Items");
  assertTextTokenVariable(showResult.Text, "Items");
});

test("appendVariable 支持追加上游 action 输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Append Variable Output",
    workflow: (shortcut) => {
      const item = shortcut.text("Task");
      shortcut.appendVariable("Items", item);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.appendvariable");

  assertActionOutputAttachment(parameters.WFInput, "文本");
  assert.equal(parameters.WFVariableName, "Items");
});
