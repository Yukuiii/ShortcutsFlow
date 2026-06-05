# ShortcutsFlow

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Apple Shortcuts](https://img.shields.io/badge/Apple%20Shortcuts-workflows-FF9500?logo=apple&logoColor=white)](https://support.apple.com/guide/shortcuts/welcome/ios)
[![Status](https://img.shields.io/badge/status-alpha-7C3AED)](#设计边界)

[English](README.md)

ShortcutsFlow 是一个用于生成 Apple Shortcuts workflow 文件的 TypeScript 框架。

当前版本生成的是**未签名**的 `.shortcut` 文件，本质是 Apple binary plist。发布或导入前可以再调用 macOS 的 `shortcuts sign` 生成已签名文件。

ShortcutsFlow 与 Apple 没有关联。

## 设计边界

- `plist` 格式是 Apple 公开格式。
- `WFWorkflowActions` 等 Shortcut schema 是反向整理的内部结构，不属于 Apple 官方稳定 API。
- TypeScript 只在构建期运行；快捷指令运行时执行的是生成出来的 Shortcuts actions。

## 快速开始

```bash
npm install
npm run build
npm run example:build
npm run example:inspect
```

初始化一个新的开发者项目：

```bash
npm create shortcutsflow my-shortcut
cd my-shortcut
npm install
npm run build
```

生成结果位于：

```txt
examples/dist/basic-shortcut.unsigned.shortcut
examples/dist/basic-shortcut.unsigned.plist
examples/dist/basic-shortcut.unsigned.json
```

如需签名：

```bash
shortcuts sign --mode anyone --input "examples/dist/basic-shortcut.unsigned.shortcut" --output "examples/dist/basic-shortcut.shortcut"
```

## 当前 DSL 能力

核心 Native action 对照表见 [packages/shortcutsflow/NATIVE_ACTIONS.md](packages/shortcutsflow/NATIVE_ACTIONS.md)。

Builder action：

```txt
shortcut.comment
shortcut.text
shortcut.dictionary
shortcut.setVariable
shortcut.showResult
shortcut.url
shortcut.openURL
shortcut.notification
shortcut.getDictionaryValue
shortcut.getContentsOfURL
shortcut.base64Encode
shortcut.base64Decode
```

控制流：

```txt
shortcut.if
shortcut.when
shortcut.repeatEach
shortcut.chooseFromMenu
```

条件：

```txt
shortcut.exists
shortcut.equals
value.exists
value.equals
value.replace
value.split
value.match
value.get
value.getItem
value.base64Encode
value.base64Decode
```

这些控制流会在编译阶段降级为 Shortcuts 内部 action：

```txt
is.workflow.actions.conditional
is.workflow.actions.repeat.each
is.workflow.actions.choosefrommenu
```

## 示例

```ts
import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.shortcuts),
  workflow: (shortcut) => {
    shortcut.comment("Generated from TypeScript.");

    const config = shortcut.dictionary({
      env: "dev",
      retries: 3,
      enabled: true,
      encodedConfigUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbS9jb25maWcuanNvbg==",
    });
    const message = shortcut.text("Hello from TypeScript");
    const configUrl = config.get("encodedConfigUrl").base64Decode();
    const remoteConfig = shortcut.getContentsOfURL(configUrl);

    shortcut.when(message.exists(), (shortcut) => {
      shortcut.notification("Build complete", message);
    });

    shortcut.chooseFromMenu("Choose next action", {
      "Show Message": (shortcut) => {
        shortcut.showResult(message);
      },
    });

    shortcut.showResult(remoteConfig);
  },
});
```

## 快捷指令图标

导入 `icon` 辅助对象即可使用内置的 Shortcuts 颜色和图标映射：

```ts
import { defineShortcut, icon } from "shortcutsflow";

defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.shortcuts),
  workflow: (shortcut) => {
    shortcut.showResult("Hello");
  },
});
```

也可以直接传入 map 里的值：

```ts
defineShortcut({
  name: "Flight",
  icon: {
    color: icon.color.blue,
    glyph: icon.glyph.airplane,
  },
  workflow: (shortcut) => {
    shortcut.showResult("Ready");
  },
});
```

`icon.color` 来自 `colors.json` 的 Shortcuts 颜色映射；`icon.glyph` 来自 `glyphs.json` 的图标映射。

如果需要精确复刻 plist fixture，可以使用原始值：

```ts
import { defineShortcut, icon } from "shortcutsflow";

defineShortcut({
  name: "Fixture",
  icon: icon.create(icon.rawColor(463140863), icon.rawGlyph(59684)),
  workflow: (shortcut) => {
    shortcut.showResult("Hello");
  },
});
```

## 项目结构

```txt
packages/
  shortcutsflow/
    src/
      actions/
      cli/
      compiler/
      core/
      plist/
    NATIVE_ACTIONS.md
  create/     # npm create shortcutsflow 初始化命令

examples/
  basic-shortcut.ts

developer-project/
  # npm create shortcutsflow 生成的样例项目
```

## 扩展建议

优先扩展顺序：

1. 从导出的未签名 `.shortcut` 中整理常用 action schema。
2. 完善变量引用、文本 token、字典取值和 action output 引用。
3. 增加字典取值、HTTP、文件、剪贴板等常用 action。
4. 为每个 action 建立 fixture 和 snapshot 测试。
