import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import { assertActionOutputAttachment, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("detectDictionary 支持字面量 JSON 输入", () => {
  const actions = compileActions(defineShortcut({
    name: "Detect Dictionary Literal",
    workflow: (shortcut) => {
      shortcut.detectDictionary("{\"ok\":true}");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.detect.dictionary");

  assert.equal(parameters.WFInput, "{\"ok\":true}");
  assertUuid(parameters);
});

test("detectDictionary 支持上游 action 输出输入", () => {
  const actions = compileActions(defineShortcut({
    name: "Detect Dictionary Output",
    workflow: (shortcut) => {
      const response = shortcut.getContentsOfURL("https://example.com/config.json");
      shortcut.detectDictionary(response);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.detect.dictionary");

  assertActionOutputAttachment(parameters.WFInput, "URL的内容");
});
