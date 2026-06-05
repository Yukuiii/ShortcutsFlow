# create-shortcutsflow

[English](README.md)

ShortcutsFlow 项目初始化器。

使用这个包可以创建一个最小 TypeScript 项目，并通过 `shortcutsflow` CLI 构建 Apple Shortcuts workflow 文件。

## 使用

```bash
npm create shortcutsflow my-shortcut
cd my-shortcut
npm install
npm run build
```

也可以直接运行初始化器：

```bash
npx create-shortcutsflow my-shortcut
```

## 生成的项目

目标目录必须不存在或为空目录。项目名称会从目标目录名推导，并规范化为 npm package name。

```txt
my-shortcut/
  package.json
  shortcuts.config.ts
  tsconfig.json
  src/
    shortcut.ts
  README.md
```

生成的项目会依赖匹配版本的 `shortcutsflow`，并包含一个示例快捷指令。

## 生成的命令

```bash
npm run build
npm run check
npm run inspect
npm run sign
```

`build` 会把未签名的 Shortcuts 产物写入 `dist/`。`sign` 会调用 macOS Shortcuts CLI 生成已签名的 `.shortcut` 文件。

## 开发

在 monorepo 根目录执行：

```bash
npm install
npm run build
npm test
```
