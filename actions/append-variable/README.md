# Append Variable

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Add to Variable |
| Builder DSL | `shortcut.appendVariable(name, input)` |
| Identifier | `is.workflow.actions.appendvariable` |
| 输出 | 命名变量引用 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要追加到变量的输入。 |
| `WFVariableName` | `string` | 运行期变量名。 |

## 编译规则

- `name` 编译到 `WFVariableName`。
- `input` 编译到 `WFInput`。
- action 本身不写 `UUID`，DSL 返回同名变量引用供后续 action 使用。

