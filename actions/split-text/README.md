# Split Text

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Split Text |
| Builder DSL | `shortcut.splitText(input, options?)` |
| Identifier | `is.workflow.actions.text.split` |
| 输出 | `拆分文本` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` 或 `WFTextTokenAttachment` | 要拆分的文本。 |
| `WFTextSeparator` | `string` | 分隔符，默认 `New Lines`。 |
| `Show-text` | `boolean` | 当前固定写入 `true`。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `text`。
- `options.separator` 编译到 `WFTextSeparator`。
- 未设置 separator 时使用 `New Lines`。

