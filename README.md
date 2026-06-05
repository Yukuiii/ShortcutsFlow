# ShortcutsFlow

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Apple Shortcuts](https://img.shields.io/badge/Apple%20Shortcuts-workflows-FF9500?logo=apple&logoColor=white)](https://support.apple.com/guide/shortcuts/welcome/ios)
[![Status](https://img.shields.io/badge/status-alpha-7C3AED)](#design-boundaries)

[简体中文](README.zh-CN.md)

ShortcutsFlow is a TypeScript framework for generating Apple Shortcuts workflow files.

The current template generates **unsigned** `.shortcut` files. They are Apple binary property lists under the hood. Before sharing or importing them, you can sign the generated file with the macOS `shortcuts sign` command.

ShortcutsFlow is not affiliated with Apple.

## Design Boundaries

- `plist` is Apple's public property list format.
- `WFWorkflowActions` and related Shortcut schema details are reverse-engineered internal structures, not an official stable Apple API.
- TypeScript only runs at build time; at runtime, the Shortcuts app executes the generated Shortcuts actions.

## Quick Start

```bash
npm install
npm run build
npm run example:build
npm run example:inspect
```

Generated files:

```txt
examples/dist/basic-shortcut.unsigned.shortcut
examples/dist/basic-shortcut.unsigned.plist
examples/dist/basic-shortcut.unsigned.json
```

To sign the generated shortcut:

```bash
shortcuts sign --mode anyone --input "examples/dist/basic-shortcut.unsigned.shortcut" --output "examples/dist/basic-shortcut.shortcut"
```

## DSL Capabilities

The native action reference lives in [packages/actions/NATIVE_ACTIONS.md](packages/actions/NATIVE_ACTIONS.md).

Builder actions:

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

Control flow:

```txt
shortcut.if
shortcut.repeatEach
shortcut.chooseFromMenu
```

Conditions:

```txt
shortcut.exists
shortcut.equals
```

These control-flow nodes are compiled down to native Shortcuts actions:

```txt
is.workflow.actions.conditional
is.workflow.actions.repeat.each
is.workflow.actions.choosefrommenu
```

## Example

```ts
import { defineShortcut } from "@shortcutsflow/actions";
import { icon } from "@shortcutsflow/core";

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
    const encodedConfigUrl = shortcut.getDictionaryValue(config, "encodedConfigUrl");
    const configUrl = shortcut.base64Decode(encodedConfigUrl);
    const remoteConfig = shortcut.getContentsOfURL(configUrl);

    shortcut.if(shortcut.exists(message), {
      then: (shortcut) => {
        shortcut.notification("Build complete", message);
      },
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

## Shortcut Icon

Import the `icon` helper to use the bundled Shortcuts color and glyph maps:

```ts
import { defineShortcut } from "@shortcutsflow/actions";
import { icon } from "@shortcutsflow/core";

defineShortcut({
  name: "Basic Shortcut",
  icon: icon.create(icon.color.blue, icon.glyph.shortcuts),
  workflow: (shortcut) => {
    shortcut.showResult("Hello");
  },
});
```

You can also pass the map values directly:

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

`icon.color` contains the Shortcuts colors from `colors.json`; `icon.glyph` contains the glyphs from `glyphs.json`.

If you need to reproduce a plist fixture exactly, use raw values:

```ts
import { defineShortcut } from "@shortcutsflow/actions";
import { icon } from "@shortcutsflow/core";

defineShortcut({
  name: "Fixture",
  icon: icon.create(icon.rawColor(463140863), icon.rawGlyph(59684)),
  workflow: (shortcut) => {
    shortcut.showResult("Hello");
  },
});
```

## Project Structure

```txt
packages/
  core/       # Shortcut AST and value model
  actions/    # Builder DSL used by developers
  compiler/   # AST -> WFWorkflowActions -> Shortcut plist
  plist/      # plist XML / binary serialization
  cli/        # build / inspect / sign commands

examples/
  basic-shortcut.ts
```

## Extension Plan

Recommended implementation order:

1. Export unsigned `.shortcut` files and use them to document common action schemas.
2. Improve variable references, text tokens, dictionary access, and action output references.
3. Add common actions for dictionary access, HTTP, files, and clipboard workflows.
4. Add fixtures and snapshot tests for each action.
