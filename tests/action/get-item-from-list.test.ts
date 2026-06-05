import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { compileShortcut } from "@shortcutsflow/compiler";
import {
  actionsWithIdentifier,
  assertActionOutputAttachment,
  assertUuid,
  assertVariableAttachment,
  compileActions,
  params,
} from "./helpers.js";

test("getItemFromList 支持默认 first、last 和 random 模式", () => {
  const actions = compileActions(defineShortcut({
    name: "Get Item From List Modes",
    workflow: (shortcut) => {
      const items = shortcut.text("one,two");
      shortcut.getItemFromList(items);
      shortcut.getItemFromList(items, {
        mode: "last",
      });
      shortcut.getItemFromList(items, {
        mode: "random",
      });
    },
  }));
  const listActions = actionsWithIdentifier(actions, "is.workflow.actions.getitemfromlist");

  assert.equal(listActions.length, 3);
  assert.deepEqual(listActions.map((action) => params(action).WFItemSpecifier), [
    "First Item",
    "Last Item",
    "Random Item",
  ]);
  for (const action of listActions) {
    const parameters = params(action);

    assertActionOutputAttachment(parameters.WFInput, "文本");
    assertUuid(parameters);
  }
});

test("getItemFromList 支持 range 模式和变量范围起点", () => {
  const actions = compileActions(defineShortcut({
    name: "Get Item From List Range",
    workflow: (shortcut) => {
      const items = shortcut.setVariable("Items", "one,two");
      const start = shortcut.setVariable("Start", 1);
      shortcut.getItemFromList(items, {
        mode: "range",
        start,
      });
    },
  }));
  const listAction = actionsWithIdentifier(actions, "is.workflow.actions.getitemfromlist")[0];

  assert.notEqual(listAction, undefined);
  const parameters = params(listAction);

  assertVariableAttachment(parameters.WFInput, "Items");
  assert.equal(parameters.WFItemSpecifier, "Items in Range");
  assertVariableAttachment(parameters.WFItemRangeStart, "Start");
});

test("getItemFromList range 模式缺少 start 时会抛出错误", () => {
  const shortcut = defineShortcut({
    name: "Invalid Range",
    workflow: (shortcut) => {
      shortcut.getItemFromList("one,two", {
        mode: "range",
      } as never);
    },
  });

  assert.throws(
    () => compileShortcut(shortcut),
    /getItemFromList range mode requires a start option/,
  );
});
