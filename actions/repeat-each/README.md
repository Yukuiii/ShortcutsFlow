# Repeat Each

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Repeat with Each |
| Builder DSL | `shortcut.repeatEach(input, body)` |
| Identifier | `is.workflow.actions.repeat.each` |
| 输出 | 控制流 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要遍历的输入。 |
| `GroupingIdentifier` | `string` | 同一组循环控制流的分组标识。 |
| `WFControlFlowMode` | `number` | `0` 开始，`2` 结束。 |
| `UUID` | `string` | 结束 action 的唯一标识。 |

## 编译规则

- `input` 编译到 repeat start action 的 `WFInput`。
- `body` 中声明的 action 编译到 start 和 end 之间。
- start 和 end 共享同一个 `GroupingIdentifier`。

