# shortcutsflow

[English](README.md)

用于生成 Apple Shortcuts workflow 文件的 TypeScript 框架和 CLI。

ShortcutsFlow 会把 TypeScript 快捷指令定义编译为未签名的 `.shortcut` 文件，同时输出 XML plist 和 JSON 调试文件。生成的快捷指令在分享或导入前，可以使用 macOS 的 `shortcuts` 命令签名。

ShortcutsFlow 与 Apple 没有关联。

## 环境要求

- Node.js 20 或更新版本。
- 构建未签名 `.shortcut` 文件支持跨平台，不需要 `plutil`。
- `shortcutsflow inspect` 需要 macOS 的 `plutil`。
- `shortcutsflow sign` 需要 macOS Shortcuts CLI。

## 安装

```bash
npm install shortcutsflow
```

## 定义快捷指令

```ts
import { defineShortcut, icon } from "shortcutsflow";

export default defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.shortcuts),
workflow: (shortcut) => {
    const message = shortcut.text("Hello from ShortcutsFlow");
    shortcut.showResult(message);
  },
});
```

可复用 workflow 片段就是普通函数。如果希望调用位置保持 DSL 风格，可以使用 `shortcut.use(...)`：

```ts
import { type ShortcutComponent, type ValueInput } from "shortcutsflow";

export const Notify: ShortcutComponent<{
  message: ValueInput;
}> = (shortcut, props) => {
  shortcut.notification("Done", props.message);
};
```

## 配置入口

如果不想每次执行 CLI 时手动传入入口文件，可以在项目根目录创建 `shortcuts.config.ts`。

```ts
export default {
  shortcuts: [
    "src/shortcut.ts",
  ],
  outputDir: "dist",
};
```

## CLI

```bash
npx shortcutsflow build
npx shortcutsflow check
npx shortcutsflow inspect dist/shortcut.unsigned.shortcut
npx shortcutsflow sign dist/shortcut.unsigned.shortcut dist/shortcut.shortcut
```

`build` 会为每个快捷指令源文件写入以下文件：

```txt
dist/<name>.unsigned.plist
dist/<name>.unsigned.json
dist/<name>.unsigned.shortcut
```

## 公开 API

包只从根模块公开稳定的 builder DSL 和图标辅助对象。

常用 builder action 包括：

```txt
shortcut.comment
shortcut.use
shortcut.text
shortcut.dictionary
shortcut.setVariable
shortcut.showResult
shortcut.showAlert
shortcut.url
shortcut.openURL
shortcut.notification
shortcut.getDictionaryValue
shortcut.getContentsOfURL
shortcut.base64Encode
shortcut.base64Decode
shortcut.askForInput
shortcut.if
shortcut.when
shortcut.repeatEach
shortcut.chooseFromMenu
```

Native action 覆盖情况见 [NATIVE_ACTIONS.md](NATIVE_ACTIONS.md)。

## 开发

在 monorepo 根目录执行：

```bash
npm install
npm run build
npm run typecheck
npm test
```
