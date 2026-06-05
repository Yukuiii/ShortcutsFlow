import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "@shortcutsflow/actions";
import {
  asArray,
  asRecord,
  assertTextTokenActionOutput,
  assertUuid,
  compileActions,
  paramsFor,
} from "./helpers.js";

test("getContentsOfURL 支持最小 URL 输入", () => {
  const actions = compileActions(defineShortcut({
    name: "Get Contents URL Minimal",
    workflow: (shortcut) => {
      shortcut.getContentsOfURL("https://example.com/config.json");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.downloadurl");

  assert.equal(parameters.WFURL, "https://example.com/config.json");
  assert.equal("WFHTTPMethod" in parameters, false);
  assert.equal("WFHTTPHeaders" in parameters, false);
  assertUuid(parameters);
});

test("getContentsOfURL 支持 URL 输出、HTTP method 和 headers", () => {
  const actions = compileActions(defineShortcut({
    name: "Get Contents URL Options",
    workflow: (shortcut) => {
      const endpoint = shortcut.url("https://example.com/config.json");
      shortcut.getContentsOfURL(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.downloadurl");
  const headers = asRecord(parameters.WFHTTPHeaders, "headers should be a dictionary field value");
  const value = asRecord(headers.Value, "headers.Value should be an object");
  const items = asArray<Record<string, unknown>>(
    value.WFDictionaryFieldValueItems,
    "header items should be an array",
  );

  assertTextTokenActionOutput(parameters.WFURL, "URL");
  assert.equal(parameters.WFHTTPMethod, "GET");
  assert.equal(parameters.ShowHeaders, true);
  assert.equal(items.length, 1);
  assert.deepEqual(asRecord(items[0]?.WFKey, "header key").Value, { string: "Accept" });
});
