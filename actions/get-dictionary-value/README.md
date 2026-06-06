# Get Dictionary Value

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Get Dictionary Value |
| Builder DSL | `shortcut.getDictionaryValue(input, key)` |
| Identifier | `is.workflow.actions.getvalueforkey` |
| 输出 | `词典值` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `WFTextTokenAttachment` | 词典输入。 |
| `WFDictionaryKey` | `string` 或 `WFTextTokenString` | 要读取的 key。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFInput`。
- `key` 编译到 `WFDictionaryKey`。
- 也可以使用 `runtimeValue.get(key)` 链式读取词典值。

