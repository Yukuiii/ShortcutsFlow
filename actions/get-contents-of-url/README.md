# Get Contents of URL

## 基本信息

| 字段 | 值 |
| --- | --- |
| Native action | Get Contents of URL |
| Builder DSL | `shortcut.getContentsOfURL(input, options?)` |
| Identifier | `is.workflow.actions.downloadurl` |
| 输出 | `URL的内容` |

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `WFURL` | `string` 或 `WFTextTokenString` | 请求 URL。 |
| `WFHTTPMethod` | `string` | HTTP 方法，未设置时省略。 |
| `WFHTTPHeaders` | `WFDictionaryFieldValue` | HTTP 请求头词典。 |
| `ShowHeaders` | `boolean` | 传入 headers 时写入 `true`。 |
| `UUID` | `string` | 输出 action 的唯一标识。 |

## 编译规则

- `input` 编译到 `WFURL`。
- `options.method` 编译到 `WFHTTPMethod`。
- `options.headers` 编译到 `WFHTTPHeaders`，并写入 `ShowHeaders = true`。

