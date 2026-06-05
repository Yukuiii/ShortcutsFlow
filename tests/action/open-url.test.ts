import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertActionOutputAttachment, compileActions, paramsFor } from "./helpers.js";

test("openURL 支持字面量 URL", () => {
  const actions = compileActions(defineShortcut({
    name: "Open URL Literal",
    workflow: (shortcut) => {
      shortcut.openURL("https://www.apple.com");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.openurl");

  assert.equal(parameters.WFInput, "https://www.apple.com");
  assert.equal(parameters["Show-WFInput"], true);
  assert.equal("UUID" in parameters, false);
});

test("openURL 支持 URL action 输出", () => {
  const actions = compileActions(defineShortcut({
    name: "Open URL Output",
    workflow: (shortcut) => {
      const url = shortcut.url("https://www.apple.com");
      shortcut.openURL(url);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.openurl");

  assertActionOutputAttachment(parameters.WFInput, "URL");
  assert.equal(parameters["Show-WFInput"], true);
});
