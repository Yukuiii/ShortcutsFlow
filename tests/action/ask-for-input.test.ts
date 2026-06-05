import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import { assertTextTokenActionOutput, assertUuid, compileActions, paramsFor } from "./helpers.js";

test("askForInput 支持提示文本和默认答案", () => {
  const actions = compileActions(defineShortcut({
    name: "Ask For Input",
    workflow: (shortcut) => {
      shortcut.askForInput("输入 cookie", {
        defaultAnswer: "",
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.ask");

  assert.equal(parameters.WFAskActionPrompt, "输入 cookie");
  assert.equal(parameters.WFAskActionDefaultAnswer, "");
  assertUuid(parameters);
});

test("askForInput 支持提示引用上游输出且默认答案可省略", () => {
  const actions = compileActions(defineShortcut({
    name: "Ask For Input Output Prompt",
    workflow: (shortcut) => {
      const prompt = shortcut.text("输入 cookie");
      shortcut.askForInput(prompt);
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.ask");

  assertTextTokenActionOutput(parameters.WFAskActionPrompt, "文本");
  assert.equal("WFAskActionDefaultAnswer" in parameters, false);
});
