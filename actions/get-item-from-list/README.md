# Get Item from List

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Get Item from List |
| Builder DSL | `shortcut.getItemFromList(input, options?)` |
| Identifier | `is.workflow.actions.getitemfromlist` |
| 输出 | `来自列表的项目` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 列表输入。 |
| `WFItemSpecifier` | `string` | 取值模式。 |
| `WFItemRangeStart` | `number` 或 `WFTextTokenAttachment` | range 模式的起始位置。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- 默认模式编译为 `WFItemSpecifier = "First Item"`。
- `mode: "last"` 编译为 `Last Item`。
- `mode: "random"` 编译为 `Random Item`。
- `mode: "range"` 编译为 `Items in Range`，并要求传入 `start`。

