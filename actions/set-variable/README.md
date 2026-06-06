# Set Variable

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Set Variable |
| Builder DSL | `shortcut.setVariable(name, input?)` |
| Identifier | `is.workflow.actions.setvariable` |
| 输出 | 命名变量引用 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFVariableName` | `string` | 运行期变量名。 |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 写入变量的输入，未设置时省略。 |

## 编译规则

- `name` 编译到 `WFVariableName`。
- `input` 编译到 `WFInput`，未传入时只创建变量引用。
- action 本身不写 `UUID`，DSL 返回同名变量引用。

