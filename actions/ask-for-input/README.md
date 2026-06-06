# Ask for Input

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Ask for Input |
| Builder DSL | `shortcut.askForInput(promptOrOptions?, options?)` |
| Identifier | `is.workflow.actions.ask` |
| 输出 | `提供的输入` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `UUID` | `string` | 输出 action 的唯一标识，供后续 action 引用用户输入结果。 |
| `WFAskActionPrompt` | `string` 或 `WFTextTokenString` | 提示文本，未设置时可省略。 |
| `WFAskActionDefaultAnswer` | `string` 或 `WFTextTokenString` | 默认回答，未设置时可省略。 |
| `WFInputType` | `string` | 输入类型，已确认值包括 `Number`、`URL`、`Date`、`Date and Time`、`Time`。 |
| `WFAllowsMultilineText` | `boolean` | 文本输入是否允许多行，关闭时写 `false`。 |
| `WFAskActionAllowsDecimalNumbers` | `boolean` | 数字输入是否允许小数，关闭时写 `false`。 |
| `WFAskActionAllowsNegativeNumbers` | `boolean` | 数字输入是否允许负数，关闭时写 `false`。 |

## 文本输入

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.ask";
  WFWorkflowActionParameters = {
    UUID = "8C8BD760-DDAE-4EC9-BD55-29C42D5D382E";
    WFAskActionPrompt = "输入文本";
    WFAskActionDefaultAnswer = "文本";
  };
}
```

## 文本输入关闭多行

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.ask";
  WFWorkflowActionParameters = {
    UUID = "8C8BD760-DDAE-4EC9-BD55-29C42D5D382E";
    WFAskActionPrompt = "输入文本";
    WFAllowsMultilineText = false;
  };
}
```

## 提示引用 Action 输出

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.ask";
  WFWorkflowActionParameters = {
    UUID = "8C8BD760-DDAE-4EC9-BD55-29C42D5D382E";
    WFAskActionPrompt = {
      WFSerializationType = "WFTextTokenString";
      Value = {
        string = "￼";
        attachmentsByRange = {
          "{0, 1}" = {
            Type = "ActionOutput";
            OutputName = "文本";
            OutputUUID = "6ABDF22C-B61F-4DBA-B1B0-D1E73B84AE0C";
          };
        };
      };
    };
  };
}
```

## 数字输入

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.ask";
  WFWorkflowActionParameters = {
    UUID = "06351C7F-20FD-4DF6-BFEB-3DEDACD0AD6D";
    WFInputType = "Number";
  };
}
```

## 数字输入关闭小数和负数

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.ask";
  WFWorkflowActionParameters = {
    UUID = "06351C7F-20FD-4DF6-BFEB-3DEDACD0AD6D";
    WFInputType = "Number";
    WFAskActionAllowsDecimalNumbers = false;
    WFAskActionAllowsNegativeNumbers = false;
  };
}
```

## 其他输入类型

```plist
{
  WFWorkflowActionIdentifier = "is.workflow.actions.ask";
  WFWorkflowActionParameters = {
    UUID = "7647B531-6E49-497C-B362-5E37FE80991A";
    WFInputType = "URL";
  };
}
```

```plist
WFInputType = "Date";
WFInputType = "Date and Time";
WFInputType = "Time";
```

## 编译规则

- `prompt` 编译到 `WFAskActionPrompt`，未传 prompt 时省略。
- `defaultAnswer` 编译到 `WFAskActionDefaultAnswer`。
- `inputType: "Text"` 不写 `WFInputType`，因为文本是默认输入类型。
- `inputType: "Number"` 编译 `WFInputType = "Number"`。
- `allowDecimal` 编译到 `WFAskActionAllowsDecimalNumbers`，未设置时省略。
- `allowNegative` 编译到 `WFAskActionAllowsNegativeNumbers`，未设置时省略。
- `allowMultipleLines` 编译到 `WFAllowsMultilineText`，未设置时省略。
- 布尔参数为 `true` 时通常可省略；显式关闭时写 `false` 更贴近 Shortcuts 原生导出。
