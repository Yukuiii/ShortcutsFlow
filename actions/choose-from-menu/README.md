# Choose from Menu

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Choose from Menu |
| Builder DSL | `shortcut.chooseFromMenu(prompt, items)` |
| Identifier | `is.workflow.actions.choosefrommenu` |
| 输出 | 控制流 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFMenuPrompt` | `string` | 菜单提示。 |
| `WFMenuItems` | `string[]` | 菜单项标题列表，仅开始 action 写入。 |
| `WFMenuItemTitle` | `string` | 当前菜单项标题，仅菜单项分支 action 写入。 |
| `GroupingIdentifier` | `string` | 同一组菜单控制流的分组标识。 |
| `WFControlFlowMode` | `number` | `0` 开始，`1` 菜单项分支，`2` 结束。 |
| `UUID` | `string` | 结束 action 的唯一标识。 |

## 编译规则

- 每个菜单会编译为开始、每个菜单项分支和结束 action。
- `items` 对象的 key 作为菜单项标题。
- 每个分支中的 workflow 会被编译到对应菜单项 action 后面。

