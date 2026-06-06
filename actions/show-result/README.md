# Show Result

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Show Result |
| Builder DSL | `shortcut.showResult(input)` |
| Identifier | `is.workflow.actions.showresult` |
| 输出 | 无 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `Text` | `string` 或 `WFTextTokenString` | 显示内容，支持普通文本或运行期变量/action 输出引用。 |

## 普通文本

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.showresult";
  WFWorkflowActionParameters = {
    Text = "显示普通文本";
  };
}
```

## Action 输出引用

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.showresult";
  WFWorkflowActionParameters = {
    Text = {
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

- 字面量输入直接写入 `Text`。
- `ShortcutValueRef` 输入编译为 `WFTextTokenString`。
- `"{0, 1}"` 表示 `string` 中从第 0 个字符开始、长度为 1 的占位符绑定到附件。
- `OutputUUID` 必须指向上游带 `UUID` 的 action。
