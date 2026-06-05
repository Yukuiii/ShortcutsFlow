import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { actionsWithIdentifier, compileActions, params } from "./helpers.js";

test("chooseFromMenu 编译菜单开始、菜单项分支和结束控制流", () => {
  const actions = compileActions(defineShortcut({
    name: "Choose From Menu",
    workflow: (shortcut) => {
      shortcut.chooseFromMenu("Choose next action", {
        "Show Message": (shortcut) => {
          shortcut.showResult("Hello");
        },
        "Open Website": (shortcut) => {
          shortcut.openURL("https://www.apple.com");
        },
      });
    },
  }));
  const menus = actionsWithIdentifier(actions, "is.workflow.actions.choosefrommenu");

  assert.equal(menus.length, 4);

  const start = params(menus[0] as never);
  const firstItem = params(menus[1] as never);
  const secondItem = params(menus[2] as never);
  const end = params(menus[3] as never);

  assert.equal(start.WFControlFlowMode, 0);
  assert.equal(start.WFMenuPrompt, "Choose next action");
  assert.deepEqual(start.WFMenuItems, ["Show Message", "Open Website"]);
  assert.equal(typeof start.GroupingIdentifier, "string");

  assert.equal(firstItem.WFControlFlowMode, 1);
  assert.equal(firstItem.WFMenuItemTitle, "Show Message");
  assert.equal(firstItem.GroupingIdentifier, start.GroupingIdentifier);

  assert.equal(secondItem.WFControlFlowMode, 1);
  assert.equal(secondItem.WFMenuItemTitle, "Open Website");
  assert.equal(secondItem.GroupingIdentifier, start.GroupingIdentifier);

  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(end.GroupingIdentifier, start.GroupingIdentifier);
  assert.equal(typeof end.UUID, "string");
});
