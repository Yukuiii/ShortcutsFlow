# Open URL

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Open URLs |
| Builder DSL | `shortcut.openURL(input)` |
| Identifier | `is.workflow.actions.openurl` |
| 输出 | 无 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要打开的 URL。 |
| `Show-WFInput` | `boolean` | 当前固定写入 `true`。 |

## 编译规则

- `input` 编译到 `WFInput`。
- 当前默认写入 `Show-WFInput = true`。
- 该 action 不产生输出，因此不写 `UUID`。

