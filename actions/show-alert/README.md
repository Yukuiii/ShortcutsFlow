# Show Alert

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Show Alert |
| Builder DSL | `shortcut.showAlert(title, message, options?)` |
| Identifier | `is.workflow.actions.alert` |
| 输出 | 无 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFAlertActionTitle` | `string` 或 `WFTextTokenString` | 提醒标题，支持普通文本或运行期变量/action 输出引用。 |
| `WFAlertActionMessage` | `string` 或 `WFTextTokenString` | 提醒内容，支持普通文本或运行期变量/action 输出引用。 |
| `WFAlertActionCancelButtonShown` | `boolean` | 是否显示取消按钮，未设置时可省略。 |

## 普通文本

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.alert";
  WFWorkflowActionParameters = {
    WFAlertActionTitle = "这是普通文本标题";
    WFAlertActionMessage = "普通文本";
  };
}
```

## 不显示取消按钮

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.alert";
  WFWorkflowActionParameters = {
    WFAlertActionTitle = "这是普通文本标题";
    WFAlertActionMessage = "普通文本";
    WFAlertActionCancelButtonShown = false;
  };
}
```

## Action 输出引用

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.alert";
  WFWorkflowActionParameters = {
    WFAlertActionTitle = {
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
    WFAlertActionMessage = {
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
    WFAlertActionCancelButtonShown = false;
  };
}
```

## 编译规则

- `title` 编译到 `WFAlertActionTitle`。
- `message` 编译到 `WFAlertActionMessage`。
- `options.showCancelButton` 只在显式传入时编译到 `WFAlertActionCancelButtonShown`。
- 字面量输入直接写入对应参数。
- `ShortcutValueRef` 输入编译为 `WFTextTokenString`。
