import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { compileShortcut } from "../../packages/shortcutsflow/src/compiler/index.ts";
import { compileActions, paramsFor } from "./helpers.js";

test("openApp 支持 bundle identifier 字符串", () => {
  const actions = compileActions(defineShortcut({
    name: "Open App String",
    workflow: (shortcut) => {
      shortcut.openApp("com.apple.shortcuts");
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.openapp");

  assert.equal(parameters.WFAppIdentifier, "com.apple.shortcuts");
  assert.deepEqual(parameters.WFSelectedApp, {
    BundleIdentifier: "com.apple.shortcuts",
    Name: "com.apple.shortcuts",
    TeamIdentifier: "0000000000",
  });
});

test("openApp 支持完整 App 信息", () => {
  const actions = compileActions(defineShortcut({
    name: "Open App Object",
    workflow: (shortcut) => {
      shortcut.openApp({
        bundleIdentifier: "com.apple.shortcuts",
        name: "快捷指令",
        teamIdentifier: "0000000000",
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.openapp");

  assert.equal(parameters.WFAppIdentifier, "com.apple.shortcuts");
  assert.deepEqual(parameters.WFSelectedApp, {
    BundleIdentifier: "com.apple.shortcuts",
    Name: "快捷指令",
    TeamIdentifier: "0000000000",
  });
});

test("openApp 缺少 bundleIdentifier 时会抛出错误", () => {
  const shortcut = defineShortcut({
    name: "Open App Invalid",
    workflow: (shortcut) => {
      shortcut.openApp({
        name: "Invalid",
      } as never);
    },
  });

  assert.throws(() => compileShortcut(shortcut), /openApp requires a bundleIdentifier/);
});
