# Repeat Each

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Repeat with Each |
| Builder DSL | `shortcut.repeatEach(input, body)` |
| Identifier | `is.workflow.actions.repeat.each` |
| 输出 | 控制流 |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFInput` | `string` 或 `WFTextTokenAttachment` | 要遍历的输入。 |
| `GroupingIdentifier` | `string` | 同一组循环控制流的分组标识。 |
| `WFControlFlowMode` | `number` | `0` 开始，`2` 结束。 |
| `UUID` | `string` | 结束 action 的唯一标识。 |

## DSL 参数

```ts
shortcut.repeatEach(input, (shortcut, item) => {
  shortcut.showResult(item);
});
```

- `input` 是要遍历的列表或运行期值。
- `item` 是当前循环项，对应 Shortcuts 运行时的 `Repeat Item` 变量引用。

## 编译规则

- `input` 编译到 repeat start action 的 `WFInput`。
- `body` 中声明的 action 编译到 start 和 end 之间。
- `item` 编译为 `Repeat Item` 变量引用，不额外生成 action。
- start 和 end 共享同一个 `GroupingIdentifier`。
