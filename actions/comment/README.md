# Comment

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Comment |
| Builder DSL | `shortcut.comment(text)` |
| Identifier | `is.workflow.actions.comment` |
| 输出 | 无 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFCommentActionText` | `string` 或 `WFTextTokenString` | 注释内容，支持普通文本或运行期变量/action 输出引用。 |

## 普通文本

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.comment";
  WFWorkflowActionParameters = {
    WFCommentActionText = "Generated from TypeScript.";
  };
}
```

## Action 输出引用

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.comment";
  WFWorkflowActionParameters = {
    WFCommentActionText = {
      WFSerializationType = "WFTextTokenString";
      Value = {
        string = "￼";
        attachmentsByRange = {
          "{0, 1}" = {
            Type = "ActionOutput";
            OutputName = "文本";
            OutputUUID = "A3BC4057-F975-4FDC-A601-D993DD29D974";
          };
        };
      };
    };
  };
}
```

## 编译规则

- `text` 编译到 `WFCommentActionText`。
- 字面量输入直接写入 `WFCommentActionText`。
- `ShortcutValueRef` 输入编译为 `WFTextTokenString`。
- `Comment` 不产生运行期输出，因此不需要 `UUID`。
