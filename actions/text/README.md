# Text

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Text |
| Builder DSL | `shortcut.text(value)` |
| Identifier | `is.workflow.actions.gettext` |
| 输出 | `文本` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFTextActionText` | `string` 或 `WFTextTokenString` | 文本内容。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `value` 编译到 `WFTextActionText`。
- 字面量直接写入字符串。
- 运行期变量或 action 输出会编译为 `WFTextTokenString`。

