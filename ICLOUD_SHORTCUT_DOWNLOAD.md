# iCloud Shortcut 下载链接提取

这份文档记录如何从 iCloud Shortcuts 分享页提取真实 `.shortcut` 下载链接。

## 背景

iCloud 分享页本身只是一个空壳 HTML，例如：

```txt
https://www.icloud.com/shortcuts/b0cfffbe07474c108ef359722c3aad5d
```

页面会加载 Shortcuts mini app 的 JavaScript bundle，再由前端请求记录接口拿到真实下载地址。

## 提取流程

1. 下载分享页 HTML。

```bash
curl -L -sS "https://www.icloud.com/shortcuts/b0cfffbe07474c108ef359722c3aad5d" \
  -o "/tmp/icloud-shortcut-page.html"
```

2. 从 HTML 中找到 bundle 路径。

```html
<script type="text/javascript" src="/applications/mini-apps/2616Build17/shortcuts/2616Build17/en-us/bundle.js"></script>
```

3. 下载并搜索 bundle。

```bash
curl -L -sS "https://www.icloud.com/applications/mini-apps/2616Build17/shortcuts/2616Build17/en-us/bundle.js" \
  -o "/tmp/icloud-shortcuts-bundle.js"

rg "api/records|downloadURL|shortcut" "/tmp/icloud-shortcuts-bundle.js"
```

4. bundle 中的关键逻辑如下。

```js
o.open("GET", "/shortcuts/api/records/" + n);
```

响应解析逻辑会读取：

```js
n.shortcut.value.downloadURL
```

如果需要已签名版本，也可以读取：

```js
n.signedShortcut.value.downloadURL
```

5. 用分享 ID 请求记录接口。

```bash
curl -L -sS "https://www.icloud.com/shortcuts/api/records/b0cfffbe07474c108ef359722c3aad5d" \
  -o "/tmp/icloud-shortcut-record.json"
```

6. 提取真实下载地址。

```bash
jq -r '.fields.shortcut.value.downloadURL' "/tmp/icloud-shortcut-record.json"
jq -r '.fields.signedShortcut.value.downloadURL' "/tmp/icloud-shortcut-record.json"
```

`downloadURL` 中通常包含 `${f}` 占位符，需要替换成任意文件名，例如 `shortcut.shortcut`。

```bash
DOWNLOAD_URL=$(jq -r '.fields.shortcut.value.downloadURL' "/tmp/icloud-shortcut-record.json")
curl -L -sS "${DOWNLOAD_URL//\$\{f\}/shortcut.shortcut}" \
  -o "/tmp/sample.unsigned.shortcut"
```

7. 验证未签名 shortcut 的 plist 结构。

```bash
file "/tmp/sample.unsigned.shortcut"
plutil -p "/tmp/sample.unsigned.shortcut"
```

## 这次样本的 Show Result 结论

样本中 `Show Result` 的真实参数不是 `WFInput`，而是 `Text`。

纯文本输入：

```plist
"WFWorkflowActionIdentifier" => "is.workflow.actions.showresult"
"WFWorkflowActionParameters" => {
  "Text" => "这是测试显示纯text"
}
```

变量输入：

```plist
"WFWorkflowActionIdentifier" => "is.workflow.actions.showresult"
"WFWorkflowActionParameters" => {
  "Text" => {
    "Value" => {
      "attachmentsByRange" => {
        "{0, 1}" => {
          "OutputName" => "文本"
          "OutputUUID" => "B7AD862B-764D-4FEF-AD5C-2F580C5D6EE1"
          "Type" => "ActionOutput"
        }
      }
      "string" => "￼"
    }
    "WFSerializationType" => "WFTextTokenString"
  }
}
```

因此框架里的 `shortcut.showResult(message)` 应该编译为 `Text: WFTextTokenString`，而不是 `WFInput: WFTextTokenAttachment`。

## 注意事项

- `downloadURL` 是 iCloud Content 的临时 URL，查询参数里带有过期时间，应该每次从记录接口重新获取。
- 未签名 `.shortcut` 是 binary plist，可以直接用 `plutil` 解析。
- 已签名 `.shortcut` 是签名封装，不能按普通 workflow plist 直接读取内部结构。
