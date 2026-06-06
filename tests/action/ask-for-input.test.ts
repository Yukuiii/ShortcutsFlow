import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import {
  actionsWithIdentifier,
  assertTextTokenActionOutput,
  assertUuid,
  compileActions,
  params,
  paramsFor,
} from "./helpers.js";

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

test("askForInput 支持文本输入关闭多行", () => {
  const actions = compileActions(defineShortcut({
    name: "Ask For Text",
    workflow: (shortcut) => {
      shortcut.askForInput("输入文本", {
        inputType: "Text",
        defaultAnswer: "文本",
        allowMultipleLines: false,
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.ask");

  assert.equal(parameters.WFAskActionPrompt, "输入文本");
  assert.equal(parameters.WFAskActionDefaultAnswer, "文本");
  assert.equal(parameters.WFAllowsMultilineText, false);
  assert.equal("WFInputType" in parameters, false);
});

test("askForInput 支持无提示数字输入并关闭小数和负数", () => {
  const actions = compileActions(defineShortcut({
    name: "Ask For Number",
    workflow: (shortcut) => {
      shortcut.askForInput({
        inputType: "Number",
        allowDecimal: false,
        allowNegative: false,
      });
    },
  }));
  const parameters = paramsFor(actions, "is.workflow.actions.ask");

  assert.equal(parameters.WFInputType, "Number");
  assert.equal(parameters.WFAskActionAllowsDecimalNumbers, false);
  assert.equal(parameters.WFAskActionAllowsNegativeNumbers, false);
  assert.equal("WFAskActionPrompt" in parameters, false);
  assertUuid(parameters);
});

test("askForInput 支持 URL、日期、日期时间和时间输入类型", () => {
  const actions = compileActions(defineShortcut({
    name: "Ask For Typed Inputs",
    workflow: (shortcut) => {
      shortcut.askForInput("输入 URL", {
        inputType: "URL",
      });
      shortcut.askForInput("输入日期", {
        inputType: "Date",
      });
      shortcut.askForInput("输入日期时间", {
        inputType: "Date and Time",
      });
      shortcut.askForInput("输入时间", {
        inputType: "Time",
      });
    },
  }));
  const parameters = actionsWithIdentifier(actions, "is.workflow.actions.ask").map(params);

  assert.deepEqual(parameters.map((item) => item.WFInputType), [
    "URL",
    "Date",
    "Date and Time",
    "Time",
  ]);
  assert.deepEqual(parameters.map((item) => item.WFAskActionPrompt), [
    "输入 URL",
    "输入日期",
    "输入日期时间",
    "输入时间",
  ]);
});
