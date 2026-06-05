import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import {
  actionsWithIdentifier,
  assertActionOutputAttachment,
  compileActions,
  params,
} from "./helpers.js";

test("repeatEach 编译 repeat start、body 和 end 控制流", () => {
  const actions = compileActions(defineShortcut({
    name: "Repeat Each",
    workflow: (shortcut) => {
      const items = shortcut.text("one,two");
      shortcut.repeatEach(items, (shortcut) => {
        shortcut.showResult("Repeat body");
      });
    },
  }));
  const repeats = actionsWithIdentifier(actions, "is.workflow.actions.repeat.each");
  const showResult = actionsWithIdentifier(actions, "is.workflow.actions.showresult");

  assert.equal(repeats.length, 2);
  assert.equal(showResult.length, 1);

  const start = params(repeats[0] as never);
  const end = params(repeats[1] as never);

  assert.equal(start.WFControlFlowMode, 0);
  assertActionOutputAttachment(start.WFInput, "文本");
  assert.equal(typeof start.GroupingIdentifier, "string");

  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(end.GroupingIdentifier, start.GroupingIdentifier);
  assert.equal(typeof end.UUID, "string");
});
