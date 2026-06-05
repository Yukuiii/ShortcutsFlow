import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertTextTokenActionOutput, compileActions, paramsFor } from "./helpers.js";

test("notification 支持只有标题", () => {
  const actions = compileActions(defineShortcut({
    name: "Notification Title",
    workflow: (shortcut) => {
      shortcut.notification("Build complete");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.notification");

  assert.equal(parameters.WFNotificationActionTitle, "Build complete");
  assert.equal("WFNotificationActionBody" in parameters, false);
});

test("notification 支持标题和正文引用上游输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Notification Output",
    workflow: (shortcut) => {
      const title = shortcut.text("ShortcutsFlow");
      const body = shortcut.text("Build complete");
      shortcut.notification(title, body);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.notification");

  assertTextTokenActionOutput(parameters.WFNotificationActionTitle, "文本");
  assertTextTokenActionOutput(parameters.WFNotificationActionBody, "文本");
});
