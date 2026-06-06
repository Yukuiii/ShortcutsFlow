# Replace Text

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Replace Text |
| Builder DSL | `shortcut.replaceText(input, find, replace)` |
| Identifier | `is.workflow.actions.text.replace` |
| 输出 | `更新后的文本` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenString` | 要处理的文本。 |
| `WFReplaceTextFind` | `string` 或 `WFTextTokenString` | 查找文本。 |
| `WFReplaceTextReplace` | `string` 或 `WFTextTokenString` | 替换文本。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFInput`。
- `find` 编译到 `WFReplaceTextFind`。
- `replace` 编译到 `WFReplaceTextReplace`。

