import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { assertActionOutputAttachment, assertTextTokenActionOutput, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("url 支持字面量 URL 并产生可引用输出", () => {
  const actions = compileActions(defineShortcut({
    name: "URL Literal",
    workflow: (shortcut) => {
      const url = shortcut.url("https://www.icloud.com/shortcuts");
      shortcut.showResult(url);
    },
  }));
  const url = paramsFor(actions, "is.workflow.actions.url");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(url.WFURLActionURL, "https://www.icloud.com/shortcuts");
  assertUuid(url);
  assertTextTokenActionOutput(showResult.Text, "URL");
});

test("url 支持上游 action 输出作为 URL 文本", () => {
  const actions = compileActions(defineShortcut({
    name: "URL Output",
    workflow: (shortcut) => {
      const value = shortcut.text("https://www.apple.com");
      shortcut.url(value);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.url");

  assertTextTokenActionOutput(parameters.WFURLActionURL, "文本");
});
