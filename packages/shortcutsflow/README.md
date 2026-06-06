# shortcutsflow

[简体中文](README.zh-CN.md)

TypeScript framework and CLI for generating Apple Shortcuts workflow files.

ShortcutsFlow compiles a TypeScript shortcut definition into an unsigned `.shortcut` file, plus XML plist and JSON debug output. The generated shortcut can be signed with the macOS `shortcuts` command before sharing or importing.

ShortcutsFlow is not affiliated with Apple.

## Requirements

- Node.js 20 or newer.
- macOS with `plutil` for building `.shortcut` files.
- macOS Shortcuts CLI for `shortcutsflow sign`.

## Installation

```bash
npm install shortcutsflow
```

## Define a Shortcut

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

## Configure Inputs

Create `shortcuts.config.ts` in the project root when you want to run the CLI without passing input files every time.

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

`build` writes these files for each shortcut source:

```txt
dist/<name>.unsigned.plist
dist/<name>.unsigned.json
dist/<name>.unsigned.shortcut
```

## Public API

The package exposes the stable builder DSL and icon helpers from the root module only.

Common builder actions include:

```txt
shortcut.comment
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
shortcut.if
shortcut.when
shortcut.repeatEach
shortcut.chooseFromMenu
```

Native action coverage is tracked in [NATIVE_ACTIONS.md](NATIVE_ACTIONS.md).

## Development

From the monorepo root:

```bash
npm install
npm run build
npm run typecheck
npm test
```
