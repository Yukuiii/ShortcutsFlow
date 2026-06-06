# Notification

## 基本信息

| 字段          | 值                                    |
| ------------- | ------------------------------------- |
| Native action | Show Notification                     |
| Builder DSL   | `shortcut.notification(title, body?)` |
| Identifier    | `is.workflow.actions.notification`    |
| 输出          | 无                                    |

## 参数

| 参数名                      | 类型                            | 说明                     |
| --------------------------- | ------------------------------- | ------------------------ |
| `WFNotificationActionTitle` | `string` 或 `WFTextTokenString` | 通知标题。               |
| `WFNotificationActionBody`  | `string` 或 `WFTextTokenString` | 通知正文，未设置时省略。 |

## 编译规则

- `title` 编译到 `WFNotificationActionTitle`。
- `body` 编译到 `WFNotificationActionBody`。
- 该 action 不产生输出，因此不写 `UUID`。
