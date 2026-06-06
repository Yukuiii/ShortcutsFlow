# URL

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | URL |
| Builder DSL | `shortcut.url(value)` |
| Identifier | `is.workflow.actions.url` |
| 输出 | `URL` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFURLActionURL` | `string` 或 `WFTextTokenString` | URL 文本。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `value` 编译到 `WFURLActionURL`。
- 字面量直接写入字符串。
- 运行期变量或 action 输出会编译为 `WFTextTokenString`。

