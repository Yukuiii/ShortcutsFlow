import { strict as assert } from "node:assert";
import test from "node:test";
import { defineShortcut } from "shortcutsflow";
import {
  actionsWithIdentifier,
  asArray,
  asRecord,
  assertActionOutputAttachment,
  assertTextTokenActionOutput,
  compileActions,
  params,
  paramsFor,
} from "./helpers.js";

test("ShortcutValueRef 可以作为上游 action 输出引用", () => {
  const actions = compileActions(defineShortcut({
    name: "Runtime Value Output",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.showResult(message);
    },
  }));
  const result = paramsFor(actions, "is.workflow.actions.showresult");

  assertTextTokenActionOutput(result.Text, "文本");
});

test("ShortcutValueRef 链式文本操作会编译为 Replace Text、Split Text 和 Get Item from List", () => {
  const actions = compileActions(defineShortcut({
    name: "Runtime Value Text Chain",
    workflow: (shortcut) => {
      const input = shortcut.askForInput("输入文本");
      const firstItem = input
        .replace("foo", "bar")
        .split("Commas")
        .getItem({
          mode: "first",
        });

      shortcut.showResult(firstItem);
    },
  }));

  const replace = paramsFor(actions, "is.workflow.actions.text.replace");
  const split = paramsFor(actions, "is.workflow.actions.text.split");
  const getItem = paramsFor(actions, "is.workflow.actions.getitemfromlist");
  const result = paramsFor(actions, "is.workflow.actions.showresult");

  assertTextTokenActionOutput(replace.WFInput, "提供的输入");
  assert.equal(replace.WFReplaceTextFind, "foo");
  assert.equal(replace.WFReplaceTextReplace, "bar");
  assertActionOutputAttachment(split.text, "更新后的文本");
  assert.equal(split.WFTextSeparator, "Commas");
  assertActionOutputAttachment(getItem.WFInput, "拆分文本");
  assert.equal(getItem.WFItemSpecifier, "First Item");
  assertTextTokenActionOutput(result.Text, "来自列表的项目");
});

test("ShortcutValueRef 词典取值、Base64 解码和 when 会编译为对应运行期 action", () => {
  const actions = compileActions(defineShortcut({
    name: "Runtime Value Dictionary Chain",
    workflow: (shortcut) => {
      const config = shortcut.dictionary({
        encodedConfigUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbS9jb25maWcuanNvbg==",
      });
      const configUrl = config.get("encodedConfigUrl").base64Decode();

      shortcut.when(configUrl.exists(), (shortcut) => {
        shortcut.showResult(configUrl);
      });
    },
  }));
  const getValue = paramsFor(actions, "is.workflow.actions.getvalueforkey");
  const base64 = paramsFor(actions, "is.workflow.actions.base64encode");
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");

  assertActionOutputAttachment(getValue.WFInput, "词典");
  assert.equal(getValue.WFDictionaryKey, "encodedConfigUrl");
  assertActionOutputAttachment(base64.WFInput, "词典值");
  assert.equal(base64.WFEncodeMode, "Decode");
  assert.equal(conditionals.length, 2);

  const start = params(conditionals[0] as never);
  const conditionInput = asRecord(start.WFInput, "condition input should be an object");

  assert.equal(start.WFCondition, 100);
  assert.equal(conditionInput.Type, "Variable");
  assertActionOutputAttachment(conditionInput.Variable, "Base64已编码内容");
});

test("ShortcutValueRef equals 可以直接作为 if 条件", () => {
  const actions = compileActions(defineShortcut({
    name: "Runtime Value Equals",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");

      shortcut.if(message.equals("Hello"), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
  const start = params(conditionals[0] as never);

  assert.equal(conditionals.length, 2);
  assert.equal(start.WFCondition, 4);
  assert.equal(start.WFConditionalActionString, "Hello");
});

test("ShortcutValueRef 文本条件可以直接组成多条件 if", () => {
  const actions = compileActions(defineShortcut({
    name: "Runtime Value Condition Group",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");

      shortcut.if(shortcut.all([
        message.contains("Hell"),
        message.endsWith("lo"),
      ]), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
  const start = params(conditionals[0] as never);
  const conditions = asRecord(start.WFConditions, "condition group should be an object");
  const value = asRecord(conditions.Value, "condition group value should be an object");
  const templates = asArray<Record<string, unknown>>(
    value.WFActionParameterFilterTemplates,
    "condition group templates should be an array",
  );

  assert.equal(conditionals.length, 2);
  assert.equal(conditions.WFSerializationType, "WFContentPredicateTableTemplate");
  assert.equal(value.WFActionParameterFilterPrefix, 0);
  assert.equal(templates.length, 2);
  assert.equal(templates[0]?.WFCondition, 99);
});
