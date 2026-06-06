# Base64 Decode

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Base64 Decode |
| Builder DSL | `shortcut.base64Decode(input)` |
| Identifier | `is.workflow.actions.base64encode` |
| 输出 | `Base64已编码内容` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要解码的 Base64 输入。 |
| `WFEncodeMode` | `string` | 编码模式，固定为 `Decode`。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFInput`。
- `WFEncodeMode` 固定写入 `Decode`。
- 该 action 使用 Shortcuts 的 Base64 action identifier，并通过 mode 区分解码。

