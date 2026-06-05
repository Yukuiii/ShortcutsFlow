import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import {
  actionsWithIdentifier,
  asRecord,
  assertActionOutputAttachment,
  assertTextTokenActionOutput,
  compileActions,
  params,
} from "./helpers.js";

test("if 支持 exists 条件并编译 then/otherwise/end 控制流", () => {
  const actions = compileActions(defineShortcut({
    name: "If Exists",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.if(shortcut.exists(message), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
        otherwise: (shortcut) => {
          shortcut.notification("No message");
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");

  assert.equal(conditionals.length, 3);

  const start = params(conditionals[0] as never);
  const otherwise = params(conditionals[1] as never);
  const end = params(conditionals[2] as never);
  const conditionInput = asRecord(start.WFInput, "condition input should be an object");

  assert.equal(start.WFControlFlowMode, 0);
  assert.equal(start.WFCondition, 100);
  assert.equal(typeof start.GroupingIdentifier, "string");
  assert.equal(conditionInput.Type, "Variable");
  assertActionOutputAttachment(conditionInput.Variable, "文本");

  assert.equal(otherwise.WFControlFlowMode, 1);
  assert.equal(otherwise.GroupingIdentifier, start.GroupingIdentifier);

  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(end.GroupingIdentifier, start.GroupingIdentifier);
  assert.equal(typeof end.UUID, "string");
});

test("if 支持 equals 条件并编译比较值", () => {
  const actions = compileActions(defineShortcut({
    name: "If Equals",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.if(shortcut.equals(message, "Hello"), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");

  assert.equal(conditionals.length, 2);

  const start = params(conditionals[0] as never);
  const end = params(conditionals[1] as never);

  assert.equal(start.WFControlFlowMode, 0);
  assert.equal(start.WFCondition, 4);
  assert.equal(start.WFConditionalActionString, "Hello");
  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(end.GroupingIdentifier, start.GroupingIdentifier);
});
