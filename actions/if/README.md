# If

## 参考shortcuts

https://www.icloud.com/shortcuts/ff773c18b6f2464cbb1a7a46e0c0e491

## 基本信息

| 字段          | 值                                 |
| ------------- | ---------------------------------- |
| Native action | If                                 |
| Builder DSL   | `shortcut.if(condition, branches)` |
| Identifier    | `is.workflow.actions.conditional`  |
| 输出          | `如果的结果`                       |

## 参数

| 参数名                      | 类型                  | 说明                                      |
| --------------------------- | --------------------- | ----------------------------------------- |
| `WFInput`                   | `WFVariable` 包装结构 | 单条件左侧输入。                          |
| `WFCondition`               | `number`              | 单条件编号。                              |
| `WFConditionalActionString` | `PlistValue`          | 单条件比较值，存在、没有值不需要该字段。  |
| `WFConditions`              | `WFContentPredicateTableTemplate` | 多条件组表格结构。             |
| `GroupingIdentifier`        | `string`              | 同一组 If 控制流的分组标识。              |
| `WFControlFlowMode`         | `number`              | `0` 开始，`1` otherwise，`2` 结束。       |
| `UUID`                      | `string`              | 结束 action 的唯一标识，也是 If 结果引用的 `OutputUUID`。 |

## 单条件映射

| DSL                                      | Shortcuts 条件 | `WFCondition` |
| ---------------------------------------- | -------------- | ------------- |
| `shortcut.equals(left, right)`           | 是             | `4`           |
| `shortcut.notEquals(left, right)`        | 不是           | `5`           |
| `shortcut.exists(value)`                 | 有任何值       | `100`         |
| `shortcut.doesNotExist(value)`           | 没有值         | `101`         |
| `shortcut.contains(left, right)`         | 包含           | `99`          |
| `shortcut.doesNotContain(left, right)`   | 不包含         | `999`         |
| `shortcut.beginsWith(left, right)`       | 开头是         | `8`           |
| `shortcut.endsWith(left, right)`         | 结尾是         | `9`           |

`ShortcutValueRef` 也支持相同条件方法，例如 `message.contains("foo")`。

## 多条件映射

`shortcut.all([...])` 和 `shortcut.any([...])` 会编译为样本里的 `WFConditions` 表格：

```plist
WFConditions = {
  WFSerializationType = "WFContentPredicateTableTemplate"
  Value = {
    WFActionParameterFilterPrefix = 0
    WFContentPredicateBoundedDate = false
    WFActionParameterFilterTemplates = (
      {
        WFInput = "<condition input>"
        WFCondition = 4
        WFConditionalActionString = "123"
      },
      {
        WFInput = "<condition input>"
        WFCondition = 5
        WFConditionalActionString = "456"
      }
    )
  }
}
```

| DSL                 | `WFActionParameterFilterPrefix` |
| ------------------- | -------------------------------- |
| `shortcut.all(...)` | `0`                              |
| `shortcut.any(...)` | `1`                              |

## 编译规则

- 有 otherwise 分支时会生成 otherwise action。
- 所有片段共享同一个 `GroupingIdentifier`。
- `shortcut.if(...)` 返回一个运行期值，后续 action 引用它时会编译为 `OutputName = "如果的结果"`。
- 多个 If 控制流都显示同名“如果的结果”，实际通过各自结束 action 的 `UUID` 区分。

## If 结果引用

后续 action 使用 `shortcut.if(...)` 的返回值时，会生成文本 token attachment：

```plist
Text = {
  WFSerializationType = "WFTextTokenString"
  Value = {
    string = "￼"
    attachmentsByRange = {
      "{0, 1}" = {
        Type = "ActionOutput"
        OutputName = "如果的结果"
        OutputUUID = "<if end action UUID>"
      }
    }
  }
}
```
