# Open App

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Open App |
| Builder DSL | `shortcut.openApp(app)` |
| Identifier | `is.workflow.actions.openapp` |
| 输出 | 无 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFAppIdentifier` | `string` | App bundle identifier。 |
| `WFSelectedApp` | `object` | Shortcuts 选择 App 信息，包含 bundle identifier、名称和 team identifier。 |

## 编译规则

- 字符串输入直接作为 bundle identifier。
- 对象输入必须包含 `bundleIdentifier`。
- `name` 和 `teamIdentifier` 未传时使用默认值。

