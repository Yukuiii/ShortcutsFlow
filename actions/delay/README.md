# Delay

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Wait |
| Builder DSL | `shortcut.delay(seconds)` |
| Identifier | `is.workflow.actions.delay` |
| 输出 | 无 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFDelayTime` | `number` 或 `WFTextTokenAttachment` | 等待秒数。 |

## 编译规则

- `seconds` 编译到 `WFDelayTime`。
- 数字字面量保留为 number。
- 运行期变量会编译为 attachment。

