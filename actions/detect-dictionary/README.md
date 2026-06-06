# Detect Dictionary

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Get Dictionary from Input |
| Builder DSL | `shortcut.detectDictionary(input)` |
| Identifier | `is.workflow.actions.detect.dictionary` |
| 输出 | `词典` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要识别为词典的输入。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFInput`。
- 该 action 有输出，因此会写入 `UUID`。

