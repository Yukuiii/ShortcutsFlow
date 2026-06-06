# Dictionary

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Dictionary |
| Builder DSL | `shortcut.dictionary(value)` |
| Identifier | `is.workflow.actions.dictionary` |
| 输出 | `词典` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFItems` | `WFDictionaryFieldValue` | 词典字段结构。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `value` 支持字符串、数字、布尔值、数组和嵌套对象。
- `WFItems` 使用 Shortcuts 的词典字段结构表示。
- 该 action 有输出，因此会写入 `UUID`。

