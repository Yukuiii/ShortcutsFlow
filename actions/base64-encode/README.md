# Base64 Encode

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Base64 Encode |
| Builder DSL | `shortcut.base64Encode(input)` |
| Identifier | `is.workflow.actions.base64encode` |
| 输出 | `Base64已编码内容` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要编码的输入。 |
| `WFEncodeMode` | `string` | 编码模式，固定为 `Encode`。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFInput`。
- `WFEncodeMode` 固定写入 `Encode`。
- 该 action 有输出，因此会写入 `UUID`。

