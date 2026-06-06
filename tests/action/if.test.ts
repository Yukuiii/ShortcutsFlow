import { strict as assert } from "node:assert";
import test from "node:test";
import {
  defineShortcut,
  type RuntimeValue,
  type ShortcutSingleCondition,
  type WorkflowBuilder,
} from "shortcutsflow";
import {
  actionsWithIdentifier,
  asArray,
  asRecord,
  assertActionOutputAttachment,
  assertTextTokenActionOutput,
  compileActions,
  params,
} from "./helpers.js";

type IfConditionCase = {
  name: string;
  build: (shortcut: WorkflowBuilder, message: RuntimeValue<string>) => ShortcutSingleCondition;
  conditionCode: number;
  right?: string;
};

test("if 支持 exists 条件并编译 then/otherwise/end 控制流", () => {
  const actions = compileActions(defineShortcut({
    name: "If Exists",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.if(shortcut.exists(message), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
        otherwise: (shortcut) => {
          shortcut.notification("No message");
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");

  assert.equal(conditionals.length, 3);

  const start = params(conditionals[0] as never);
  const otherwise = params(conditionals[1] as never);
  const end = params(conditionals[2] as never);
  const conditionInput = asRecord(start.WFInput, "condition input should be an object");

  assert.equal(start.WFControlFlowMode, 0);
  assert.equal(start.WFCondition, 100);
  assert.equal(typeof start.GroupingIdentifier, "string");
  assert.equal(conditionInput.Type, "Variable");
  assertActionOutputAttachment(conditionInput.Variable, "文本");

  assert.equal(otherwise.WFControlFlowMode, 1);
  assert.equal(otherwise.GroupingIdentifier, start.GroupingIdentifier);

  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(end.GroupingIdentifier, start.GroupingIdentifier);
  assert.equal(typeof end.UUID, "string");
});

test("if 支持 equals 条件并编译比较值", () => {
  const actions = compileActions(defineShortcut({
    name: "If Equals",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      shortcut.if(shortcut.equals(message, "Hello"), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");

  assert.equal(conditionals.length, 2);

  const start = params(conditionals[0] as never);
  const end = params(conditionals[1] as never);

  assert.equal(start.WFControlFlowMode, 0);
  assert.equal(start.WFCondition, 4);
  assert.equal(start.WFConditionalActionString, "Hello");
  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(end.GroupingIdentifier, start.GroupingIdentifier);
});

const conditionCases: IfConditionCase[] = [
  {
    name: "notEquals",
    build: (shortcut, message) => shortcut.notEquals(message, "World"),
    conditionCode: 5,
    right: "World",
  },
  {
    name: "doesNotExist",
    build: (shortcut, message) => shortcut.doesNotExist(message),
    conditionCode: 101,
  },
  {
    name: "contains",
    build: (shortcut, message) => shortcut.contains(message, "Hell"),
    conditionCode: 99,
    right: "Hell",
  },
  {
    name: "doesNotContain",
    build: (shortcut, message) => shortcut.doesNotContain(message, "World"),
    conditionCode: 999,
    right: "World",
  },
  {
    name: "beginsWith",
    build: (shortcut, message) => shortcut.beginsWith(message, "He"),
    conditionCode: 8,
    right: "He",
  },
  {
    name: "endsWith",
    build: (shortcut, message) => shortcut.endsWith(message, "lo"),
    conditionCode: 9,
    right: "lo",
  },
];

for (const conditionCase of conditionCases) {
  test(`if 支持 ${conditionCase.name} 条件`, () => {
    const actions = compileActions(defineShortcut({
      name: `If ${conditionCase.name}`,
      workflow: (shortcut) => {
        const message = shortcut.text("Hello");

        shortcut.if(conditionCase.build(shortcut, message), {
          then: (shortcut) => {
            shortcut.showResult(message);
          },
        });
      },
    }));
    const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
    const start = params(conditionals[0] as never);

    assert.equal(conditionals.length, 2);
    assert.equal(start.WFCondition, conditionCase.conditionCode);
    assertConditionInput(start, "文本");

    if (conditionCase.right === undefined) {
      assert.equal("WFConditionalActionString" in start, false);
    } else {
      assert.equal(start.WFConditionalActionString, conditionCase.right);
    }
  });
}

test("if 条件比较值支持上游 action 输出", () => {
  const actions = compileActions(defineShortcut({
    name: "If Runtime Compare Value",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");

      shortcut.if(shortcut.notEquals(message, message), {
        then: (shortcut) => {
          shortcut.showResult(message);
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
  const start = params(conditionals[0] as never);

  assert.equal(conditionals.length, 2);
  assert.equal(start.WFCondition, 5);
  assertTextTokenActionOutput(start.WFConditionalActionString, "文本");
});

test("if 支持 all 和 any 多条件组", () => {
  const actions = compileActions(defineShortcut({
    name: "If Condition Groups",
    workflow: (shortcut) => {
      const message = shortcut.text("123");

      shortcut.if(shortcut.all([
        shortcut.equals(message, "123"),
        shortcut.notEquals(message, "456"),
      ]), {
        then: (shortcut) => {
          shortcut.showResult("All matched");
        },
      });

      shortcut.if(shortcut.any([
        shortcut.equals(message, "123"),
        shortcut.contains(message, "678"),
      ]), {
        then: (shortcut) => {
          shortcut.showResult("Any matched");
        },
      });
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
  const allStart = params(conditionals[0] as never);
  const anyStart = params(conditionals[2] as never);

  assert.equal(conditionals.length, 4);
  assertConditionGroup(allStart, 0, [4, 5], ["123", "456"]);
  assertConditionGroup(anyStart, 1, [4, 99], ["123", "678"]);
});

test("if 返回值会编译为对应结束 action 的如果的结果输出", () => {
  const actions = compileActions(defineShortcut({
    name: "If Result",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      const result = shortcut.if(shortcut.exists(message), {
        then: (shortcut) => {
          shortcut.showResult("Matched");
        },
        otherwise: (shortcut) => {
          shortcut.showResult("Missing");
        },
      });

      shortcut.showResult(result);
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
  const showResults = actionsWithIdentifier(actions, "is.workflow.actions.showresult");

  assert.equal(conditionals.length, 3);
  assert.equal(showResults.length, 3);

  const end = params(conditionals[2] as never);
  const resultParameters = params(showResults[2] as never);
  const attachment = actionOutputAttachmentFromTextToken(resultParameters.Text, "if result");

  assert.equal(end.WFControlFlowMode, 2);
  assert.equal(attachment.Type, "ActionOutput");
  assert.equal(attachment.OutputName, "如果的结果");
  assert.equal(attachment.OutputUUID, end.UUID);
});

test("多个 if 返回值会按各自结束 action UUID 精确绑定", () => {
  const actions = compileActions(defineShortcut({
    name: "Multiple If Results",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");
      const firstResult = shortcut.if(shortcut.exists(message), {
        then: (shortcut) => {
          shortcut.showResult("First matched");
        },
      });

      shortcut.if(shortcut.equals(message, "Hello"), {
        then: (shortcut) => {
          shortcut.showResult("Second matched");
        },
      });

      shortcut.showResult(firstResult);
    },
  }));
  const conditionals = actionsWithIdentifier(actions, "is.workflow.actions.conditional");
  const showResults = actionsWithIdentifier(actions, "is.workflow.actions.showresult");

  assert.equal(conditionals.length, 4);
  assert.equal(showResults.length, 3);

  const firstEnd = params(conditionals[1] as never);
  const secondEnd = params(conditionals[3] as never);
  const resultParameters = params(showResults[2] as never);
  const attachment = actionOutputAttachmentFromTextToken(resultParameters.Text, "first if result");

  assert.equal(firstEnd.WFControlFlowMode, 2);
  assert.equal(secondEnd.WFControlFlowMode, 2);
  assert.notEqual(firstEnd.UUID, secondEnd.UUID);
  assert.equal(attachment.OutputName, "如果的结果");
  assert.equal(attachment.OutputUUID, firstEnd.UUID);
});

/**
 * 读取文本 token 中唯一的 action output attachment。
 */
function actionOutputAttachmentFromTextToken(
  value: unknown,
  message: string,
): Record<string, unknown> {
  const textToken = asRecord(value, `${message} should be a text token`);
  const tokenValue = asRecord(textToken.Value, `${message} value should be an object`);
  const attachments = asRecord(
    tokenValue.attachmentsByRange,
    `${message} attachments should be an object`,
  );
  const attachment = asRecord(
    attachments["{0, 1}"],
    `${message} attachment should be an object`,
  );

  assert.equal(textToken.WFSerializationType, "WFTextTokenString");
  assert.equal(tokenValue.string, "￼");
  return attachment;
}

/**
 * 断言 If 条件输入引用了指定 action 输出。
 */
function assertConditionInput(parameters: Record<string, unknown>, outputName: string): void {
  const conditionInput = asRecord(parameters.WFInput, "condition input should be an object");

  assert.equal(conditionInput.Type, "Variable");
  assertActionOutputAttachment(conditionInput.Variable, outputName);
}

/**
 * 断言 If 多条件组使用 Shortcuts 条件表结构。
 */
function assertConditionGroup(
  parameters: Record<string, unknown>,
  prefix: number,
  conditionCodes: number[],
  values: string[],
): void {
  const wrapper = asRecord(parameters.WFConditions, "condition group should be an object");
  const value = asRecord(wrapper.Value, "condition group value should be an object");
  const templates = asArray<Record<string, unknown>>(
    value.WFActionParameterFilterTemplates,
    "condition group templates should be an array",
  );

  assert.equal("WFInput" in parameters, false);
  assert.equal("WFCondition" in parameters, false);
  assert.equal(wrapper.WFSerializationType, "WFContentPredicateTableTemplate");
  assert.equal(value.WFActionParameterFilterPrefix, prefix);
  assert.equal(value.WFContentPredicateBoundedDate, false);
  assert.equal(templates.length, conditionCodes.length);

  for (const [index, template] of templates.entries()) {
    assert.equal(template.WFCondition, conditionCodes[index]);
    assert.equal(template.WFConditionalActionString, values[index]);
    assertConditionInput(template, "文本");
  }
}
