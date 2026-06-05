import { strict as assert } from "node:assert";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { assertNoRuntimeSyntaxMisuse } from "../../packages/shortcutsflow/src/cli/runtime-guard.ts";

/**
 * 写入临时 shortcut 源码并返回文件路径。
 */
function writeShortcutSource(source: string): string {
  const directory = mkdtempSync(join(tmpdir(), "shortcutsflow-guard-"));
  const file = join(directory, "shortcut.ts");

  writeFileSync(file, source);
  return file;
}

/**
 * 删除临时 shortcut 源码所在目录。
 */
function removeShortcutSource(file: string): void {
  rmSync(join(file, ".."), {
    recursive: true,
    force: true,
  });
}

test("runtime guard 允许链式 RuntimeValue 和 shortcut.when", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Allowed",
      workflow: (shortcut) => {
        const message = shortcut.askForInput("输入文本");
        const updated = message.replace("foo", "bar");
        shortcut.when(updated.exists(), (shortcut) => {
          shortcut.showResult(updated);
        });
      },
    });
  `);

  try {
    assert.doesNotThrow(() => assertNoRuntimeSyntaxMisuse(file));
  } finally {
    removeShortcutSource(file);
  }
});

test("runtime guard 拦截运行期值的原生 if", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Native If",
      workflow: (shortcut) => {
        const message = shortcut.askForInput("输入文本");
        if (message) {
          shortcut.showResult(message);
        }
      },
    });
  `);

  try {
    assert.throws(
      () => assertNoRuntimeSyntaxMisuse(file),
      /Use shortcut\.if\(value\.exists\(\), \.\.\.\) or shortcut\.when\(value\.exists\(\), \.\.\.\) instead of native if/,
    );
  } finally {
    removeShortcutSource(file);
  }
});

test("runtime guard 拦截运行期值的原生相等和加法", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Native Operators",
      workflow: (shortcut) => {
        const message = shortcut.askForInput("输入文本");
        const matched = message === "Hello";
        const merged = message + " suffix";
        shortcut.showResult(matched ? merged : message);
      },
    });
  `);

  try {
    assert.throws(
      () => assertNoRuntimeSyntaxMisuse(file),
      /Use value\.equals\(other\).*Use Shortcuts text actions/s,
    );
  } finally {
    removeShortcutSource(file);
  }
});
