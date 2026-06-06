import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertTextTokenActionOutput, compileActions, paramsFor } from "./helpers.js";

test("showAlert 支持字面量标题、内容和取消按钮", () => {
  const actions = compileActions(defineShortcut({
    name: "Show Alert Literal",
    workflow: (shortcut) => {
      shortcut.showAlert("这是普通文本标题", "普通文本", {
        showCancelButton: false,
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.alert");

  assert.equal(parameters.WFAlertActionTitle, "这是普通文本标题");
  assert.equal(parameters.WFAlertActionMessage, "普通文本");
  assert.equal(parameters.WFAlertActionCancelButtonShown, false);
  assert.equal("UUID" in parameters, false);
});

test("showAlert 支持标题和内容引用上游输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Show Alert Output",
    workflow: (shortcut) => {
      const title = shortcut.text("ShortcutsFlow");
      const message = shortcut.text("Build complete");

      shortcut.showAlert(title, message);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.alert");

  assertTextTokenActionOutput(parameters.WFAlertActionTitle, "文本");
  assertTextTokenActionOutput(parameters.WFAlertActionMessage, "文本");
  assert.equal("WFAlertActionCancelButtonShown" in parameters, false);
});
