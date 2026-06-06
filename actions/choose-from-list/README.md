# Choose from List

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Choose from List |
| Builder DSL | `shortcut.chooseFromList(input, options?)` |
| Identifier | `is.workflow.actions.choosefromlist` |
| 输出 | `选取的项目` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 待选择的列表输入。 |
| `WFChooseFromListActionPrompt` | `string` 或 `WFTextTokenString` | 选择提示，未设置时省略。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFInput`。
- `options.prompt` 编译到 `WFChooseFromListActionPrompt`。
- 该 action 有输出，因此会写入 `UUID`。

