# Native Actions Reference

这份文档记录框架优先覆盖的 Apple Shortcuts Native actions。

边界说明：

- `Native` 指 Shortcuts 内置通用动作，不包含第三方 App Intents。
- `identifier` 和参数 key 来自未签名 `.shortcut` plist、当前框架 schema、社区目录交叉整理。
- `已支持` 表示当前 DSL 和 compiler 已能生成对应 plist。
- `待实现` 表示建议优先实现，但需要用导出的未签名 shortcut fixture 再确认参数细节。
- `待确认` 表示 action 名称和 identifier 已常见，但参数结构不应在未验证前固化。

## 已支持

| Builder DSL | Native action | Identifier | 关键参数 | 输出命名 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `shortcut.comment(text)` | Comment | `is.workflow.actions.comment` | `WFCommentActionText` | 无 | 纯注释，不产生运行期输出。 |
| `shortcut.text(value)` | Text | `is.workflow.actions.gettext` | `WFTextActionText`, `UUID` | `文本` | 返回值可用 `const message = shortcut.text(...)` 接收。 |
| `shortcut.dictionary(value)` | Dictionary | `is.workflow.actions.dictionary` | `WFItems`, `UUID` | `词典` | 当前支持基础对象、数组、嵌套对象。 |
| `shortcut.setVariable(name, input?)` | Set Variable | `is.workflow.actions.setvariable` | `WFVariableName`, `WFInput` | 无 | 用于显式创建 Shortcuts 运行期命名变量；普通链式引用优先用 `const value = shortcut.text(...)`。 |
| `shortcut.showResult(input)` | Show Result | `is.workflow.actions.showresult` | `WFInput` | 无 | 用于调试和展示最终结果。 |
| `shortcut.url(value)` | URL | `is.workflow.actions.url` | `WFURLActionURL`, `UUID` | `URL` | 返回值可用 `const url = shortcut.url(...)` 接收。 |
| `shortcut.openURL(input)` | Open URLs | `is.workflow.actions.openurl` | `WFInput`, `Show-WFInput` | 无 | 当前默认显示输入。 |
| `shortcut.notification(title, body?)` | Show Notification | `is.workflow.actions.notification` | `WFNotificationActionTitle`, `WFNotificationActionBody` | 无 | 当前只覆盖标题和正文。 |
| `shortcut.getDictionaryValue(input, key)` | Get Dictionary Value | `is.workflow.actions.getvalueforkey` | `WFInput`, `WFDictionaryKey`, `UUID` | `词典值` | 后续可扩展 property/aggrandizement 快捷写法。 |
| `shortcut.getContentsOfURL(input, options?)` | Get Contents of URL | `is.workflow.actions.downloadurl` | `WFURL`, `WFHTTPMethod`, `WFHTTPHeaders`, `ShowHeaders`, `UUID` | `URL的内容` | 当前支持 method 和 headers。 |
| `shortcut.base64Encode(input)` | Base64 Encode | `is.workflow.actions.base64encode` | `WFInput`, `WFEncodeMode`, `UUID` | `Base64已编码内容` | `WFEncodeMode = Encode`。 |
| `shortcut.base64Decode(input)` | Base64 Decode | `is.workflow.actions.base64encode` | `WFInput`, `WFEncodeMode`, `UUID` | `Base64已编码内容` | `WFEncodeMode = Decode`。 |
| `shortcut.if(condition, branches)` | If | `is.workflow.actions.conditional` | `WFInput`, `WFCondition`, `WFConditionalActionString`, `GroupingIdentifier`, `WFControlFlowMode` | 控制流 | 当前条件支持 `shortcut.exists`、`shortcut.equals`。 |
| `shortcut.repeatEach(input, body)` | Repeat with Each | `is.workflow.actions.repeat.each` | `WFInput`, `GroupingIdentifier`, `WFControlFlowMode` | 控制流 | 当前未显式建模 `Repeat Item`。 |
| `shortcut.chooseFromMenu(prompt, items)` | Choose from Menu | `is.workflow.actions.choosefrommenu` | `WFMenuPrompt`, `WFMenuItems`, `WFMenuItemTitle`, `GroupingIdentifier`, `WFControlFlowMode` | 控制流 | 当前菜单项用对象 key 表示。 |

## 优先实现

这些 action 在真实快捷指令中高频出现，且对自动化框架价值高。

| 建议 DSL | Native action | Identifier | 关键参数 | 优先级 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `askForInput(options)` | Ask for Input | `is.workflow.actions.ask` | 待 fixture 确认 | P0 | 交互式流程核心动作。 |
| `chooseFromList(input, options?)` | Choose from List | `is.workflow.actions.choosefromlist` | `WFInput`, `WFChooseFromListActionPrompt`, `UUID` | P0 | 与菜单不同，输入来自列表。 |
| `getItemFromList(input, specifier)` | Get Item from List | `is.workflow.actions.getitemfromlist` | `WFInput`, `WFItemSpecifier`, `WFItemRangeStart`, `UUID` | P0 | 列表处理核心动作。 |
| `appendVariable(name, input)` | Add to Variable | `is.workflow.actions.appendvariable` | `WFVariableName`, `WFInput` | P0 | 构建列表/聚合结果常用。 |
| `stopAndOutput(input?)` | Stop and Output | `is.workflow.actions.output` | `WFOutput` | P0 | 快捷指令输出核心动作。 |
| `exitShortcut()` | Stop This Shortcut | `is.workflow.actions.exit` | 通常为空 | P0 | 提前退出流程。 |
| `repeatCount(count, body)` | Repeat | `is.workflow.actions.repeat.count` | `WFRepeatCount`, `GroupingIdentifier`, `WFControlFlowMode` | P0 | 与 `repeatEach` 并列的核心循环。 |
| `delay(seconds)` | Wait | `is.workflow.actions.delay` | `WFDelayTime` | P1 | 自动化等待常用。 |
| `number(value)` | Number | `is.workflow.actions.number` | 待 fixture 确认 | P1 | 数值计算链路基础。 |
| `math(input, operation, operand)` | Calculate | `is.workflow.actions.math` | 待 fixture 确认 | P1 | 与 number 搭配。 |
| `matchText(input, pattern)` | Match Text | `is.workflow.actions.text.match` | `text`, `WFMatchTextPattern`, `UUID` | P1 | 正则提取常用。 |
| `replaceText(input, find, replace)` | Replace Text | `is.workflow.actions.text.replace` | `WFInput`, `WFReplaceTextFind`, `WFReplaceTextReplace`, `UUID` | P1 | 文本处理常用。 |
| `splitText(input, separator)` | Split Text | `is.workflow.actions.text.split` | `text`, `WFTextSeparator`, `UUID` | P1 | 文本转列表常用。 |
| `urlEncode(input)` | URL Encode | `is.workflow.actions.urlencode` | `WFInput`, `UUID` | P1 | 请求参数拼接常用。 |
| `detectDictionary(input)` | Get Dictionary from Input | `is.workflow.actions.detect.dictionary` | `WFInput`, `UUID` | P1 | JSON 响应转字典常用。 |
| `getWebPageContents(input)` | Get Contents of Web Page | `is.workflow.actions.getwebpagecontents` | `WFInput`, `UUID` | P1 | HTML/data URL 场景常用。 |

## 系统和设备

| 建议 DSL | Native action | Identifier | 关键参数 | 优先级 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `getDeviceDetails(detail)` | Get Device Details | `is.workflow.actions.getdevicedetails` | `WFDeviceDetail`, `UUID` | P1 | 真实样本中出现了 `Current Volume`。 |
| `openApp(app)` | Open App | `is.workflow.actions.openapp` | `WFAppIdentifier`, `WFSelectedApp` | P1 | 需要建模 App bundle 信息。 |
| `setClipboard(input)` | Copy to Clipboard | `is.workflow.actions.setclipboard` | `WFInput` | P1 | 剪贴板写入。 |
| `getClipboard()` | Get Clipboard | `is.workflow.actions.getclipboard` | 通常为空或待确认 | P1 | 剪贴板读取。 |
| `showPreview(input)` | Quick Look | `is.workflow.actions.previewdocument` | `WFInput` | P2 | 调试和文件预览。 |

## 文件

| 建议 DSL | Native action | Identifier | 关键参数 | 优先级 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `createFolder(path)` | Create Folder | `is.workflow.actions.file.createfolder` | `WFFilePath` | P1 | 文件自动化基础动作。 |
| `deleteFile(input)` | Delete Files | `is.workflow.actions.file.delete` | `WFInput` | P1 | 删除类动作实现前应明确确认机制。 |
| `openFilePicker(options?)` | Open File | `is.workflow.actions.documentpicker.open` | 待 fixture 确认 | P2 | 文件输入。 |
| `saveFile(input, options?)` | Save File | `is.workflow.actions.documentpicker.save` | `WFInput` 等待确认 | P2 | 文件输出。 |

## 数据结构和列表

| 建议 DSL | Native action | Identifier | 关键参数 | 优先级 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `getName(input)` | Get Name | `is.workflow.actions.getitemname` | `WFInput`, `UUID` | P1 | 真实样本中用于取列表项目名称。 |
| `list(items)` | List | 待确认 | 待 fixture 确认 | P1 | 需要从干净导出样本确认 identifier。 |
| `count(input)` | Count | 待确认 | 待 fixture 确认 | P2 | 列表/文本计数。 |
| `filterFiles(input, rules)` | Filter Files | 待确认 | 待 fixture 确认 | P2 | 参数结构较复杂。 |
| `sort(input, options?)` | Sort | 待确认 | 待 fixture 确认 | P2 | 参数结构较复杂。 |

## 条件编号草案

`is.workflow.actions.conditional` 使用 `WFCondition` 表示判断类型。

| 条件 DSL | `WFCondition` | 说明 | 状态 |
| --- | --- | --- | --- |
| `exists(value)` | `100` | 有任何值 | 已支持 |
| `equals(left, right)` | `4` | 等于文本/值 | 已支持 |
| `doesNotExist(value)` | 待确认 | 没有任何值 | 待 fixture 确认 |
| `contains(left, right)` | 待确认 | 包含 | 待 fixture 确认 |
| `greaterThan(left, right)` | 待确认 | 大于 | 待 fixture 确认 |
| `lessThan(left, right)` | 待确认 | 小于 | 待 fixture 确认 |

## 真实样本已出现的 Native identifiers

以下来自仓库根目录的 `天猫双十一幻想岛自动任务.unsigned.json`，可作为后续 fixture 来源。

```txt
is.workflow.actions.appendvariable
is.workflow.actions.ask
is.workflow.actions.base64encode
is.workflow.actions.choosefromlist
is.workflow.actions.choosefrommenu
is.workflow.actions.comment
is.workflow.actions.conditional
is.workflow.actions.delay
is.workflow.actions.detect.dictionary
is.workflow.actions.dictionary
is.workflow.actions.documentpicker.open
is.workflow.actions.documentpicker.save
is.workflow.actions.downloadurl
is.workflow.actions.exit
is.workflow.actions.file.createfolder
is.workflow.actions.file.delete
is.workflow.actions.getclipboard
is.workflow.actions.getdevicedetails
is.workflow.actions.getitemfromlist
is.workflow.actions.getitemname
is.workflow.actions.getrichtextfromhtml
is.workflow.actions.gettext
is.workflow.actions.getvalueforkey
is.workflow.actions.getwebpagecontents
is.workflow.actions.math
is.workflow.actions.notification
is.workflow.actions.number
is.workflow.actions.openapp
is.workflow.actions.openurl
is.workflow.actions.output
is.workflow.actions.previewdocument
is.workflow.actions.repeat.count
is.workflow.actions.repeat.each
is.workflow.actions.setclipboard
is.workflow.actions.setvariable
is.workflow.actions.text.match
is.workflow.actions.text.replace
is.workflow.actions.text.split
is.workflow.actions.url
is.workflow.actions.urlencode
```

## 实现策略

新增 action 时按这个顺序走：

1. 在 Shortcuts App 中手动创建最小快捷指令并导出未签名 `.shortcut`。
2. 用 `plutil -convert json` 转成 JSON。
3. 记录 `WFWorkflowActionIdentifier` 和最小参数 key。
4. 在 `packages/actions/src/actions.ts` 加 DSL。
5. 在 `packages/compiler/src/schema.ts` 加 identifier 和默认输出名。
6. 在 `packages/compiler/src/compile.ts` 加参数编译分支。
7. 在 `examples/basic-shortcut.ts` 或 fixture 中覆盖该 action。
8. 跑 `npm run typecheck && npm run example:build && plutil -lint ...`。
