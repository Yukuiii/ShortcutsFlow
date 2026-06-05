# create-shortcutsflow

[简体中文](README.zh-CN.md)

Project initializer for ShortcutsFlow.

Use this package to scaffold a minimal TypeScript project that builds Apple Shortcuts workflow files with the `shortcutsflow` CLI.

## Usage

```bash
npm create shortcutsflow my-shortcut
cd my-shortcut
npm install
npm run build
```

The initializer can also be run directly:

```bash
npx create-shortcutsflow my-shortcut
```

## Generated Project

The target directory must not exist or must be empty. The project name is derived from the target directory name and normalized into an npm package name.

```txt
my-shortcut/
  package.json
  shortcuts.config.ts
  tsconfig.json
  src/
    shortcut.ts
  README.md
```

The generated project depends on the matching published `shortcutsflow` version and includes one example shortcut.

## Generated Commands

```bash
npm run build
npm run check
npm run inspect
npm run sign
```

`build` writes unsigned Shortcuts artifacts to `dist/`. `sign` uses the macOS Shortcuts CLI to create a signed `.shortcut` file.

## Development

From the monorepo root:

```bash
npm install
npm run build
npm test
```
