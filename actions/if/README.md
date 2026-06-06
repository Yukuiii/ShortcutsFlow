# If

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | If |
| Builder DSL | `shortcut.if(condition, branches)` |
| Identifier | `is.workflow.actions.conditional` |
| 输出 | 控制流 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `WFVariable` 包装结构 | 条件左侧输入。 |
| `WFCondition` | `number` | 条件编号，当前支持 `100` 存在、`4` 等于。 |
| `WFConditionalActionString` | `PlistValue` | equals 条件的比较值。 |
| `GroupingIdentifier` | `string` | 同一组 If 控制流的分组标识。 |
| `WFControlFlowMode` | `number` | `0` 开始，`1` otherwise，`2` 结束。 |
| `UUID` | `string` | 结束 action 的唯一标识。 |

## 编译规则

- `shortcut.exists(value)` 编译为 `WFCondition = 100`。
- `shortcut.equals(left, right)` 编译为 `WFCondition = 4`。
- 有 otherwise 分支时会生成 otherwise action。
- 所有片段共享同一个 `GroupingIdentifier`。

