import { strict as assert } from "node:assert";
import test from "node:test";
import {
  defineShortcut,
  type ShortcutComponent,
  type ShortcutDictionary,
  type ShortcutValueRef,
  type ValueInput,
} from "shortcutsflow";
import {
  actionsWithIdentifier,
  assertActionOutputAttachment,
  assertTextTokenActionOutput,
  compileActions,
  params,
  paramsFor,
} from "./helpers.js";

test("shortcut.use 支持无 props 组件并按调用位置插入 action", () => {
  const annotate: ShortcutComponent = (shortcut) => {
    shortcut.comment("From component");
  };
  const actions = compileActions(defineShortcut({
    name: "Use Component",
    workflow: (shortcut) => {
      shortcut.comment("Before");
      shortcut.use(annotate);
      shortcut.comment("After");
    },
  }));
  const comments = actionsWithIdentifier(actions, "is.workflow.actions.comment");

  assert.equal(comments.length, 3);
  assert.equal(params(comments[0] as never).WFCommentActionText, "Before");
  assert.equal(params(comments[1] as never).WFCommentActionText, "From component");
  assert.equal(params(comments[2] as never).WFCommentActionText, "After");
});

test("shortcut.use 支持带 props 组件返回运行期值", () => {
  const fetchConfig: ShortcutComponent<{
    url: ValueInput;
  }, ShortcutValueRef<ShortcutDictionary>> = (shortcut, props) => {
    const response = shortcut.getContentsOfURL(props.url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return shortcut.detectDictionary(response);
  };
  const actions = compileActions(defineShortcut({
    name: "Use Component Output",
    workflow: (shortcut) => {
      const config = shortcut.use(fetchConfig, {
        url: "https://example.com/config.json",
      });

      shortcut.showResult(config.get("service"));
    },
  }));
  const getContents = paramsFor(actions, "is.workflow.actions.downloadurl");
  const detectDictionary = paramsFor(actions, "is.workflow.actions.detect.dictionary");
  const getDictionaryValue = paramsFor(actions, "is.workflow.actions.getvalueforkey");
  const showResult = paramsFor(actions, "is.workflow.actions.showresult");

  assert.equal(getContents.WFURL, "https://example.com/config.json");
  assert.equal(getContents.WFHTTPMethod, "GET");
  assertActionOutputAttachment(detectDictionary.WFInput, "URL的内容");
  assertActionOutputAttachment(getDictionaryValue.WFInput, "词典");
  assert.equal(getDictionaryValue.WFDictionaryKey, "service");
  assertTextTokenActionOutput(showResult.Text, "词典值");
});

test("shortcut.use 可以在控制流分支中使用当前分支 builder", () => {
  const showMessage: ShortcutComponent<{
    message: ShortcutValueRef<string>;
  }> = (shortcut, props) => {
    shortcut.showResult(props.message);
  };
  const actions = compileActions(defineShortcut({
    name: "Use Component In Branch",
    workflow: (shortcut) => {
      const message = shortcut.text("Hello");

      shortcut.when(message.exists(), (shortcut) => {
        shortcut.use(showMessage, {
          message,
        });
      });
    },
  }));

  assert.deepEqual(actions.map((action) => action.WFWorkflowActionIdentifier), [
    "is.workflow.actions.gettext",
    "is.workflow.actions.conditional",
    "is.workflow.actions.showresult",
    "is.workflow.actions.conditional",
  ]);

  const showResult = params(actions[2] as never);
  assertTextTokenActionOutput(showResult.Text, "文本");
});
