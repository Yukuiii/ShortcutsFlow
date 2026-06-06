# Match Text

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Match Text |
| Builder DSL | `shortcut.matchText(input, pattern)` |
| Identifier | `is.workflow.actions.text.match` |
| 输出 | `匹配` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` 或 `WFTextTokenString` | 要匹配的文本。 |
| `WFMatchTextPattern` | `string` 或 `WFTextTokenString` | 正则表达式。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `text`。
- `pattern` 编译到 `WFMatchTextPattern`。
- 该 action 有输出，因此会写入 `UUID`。

