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

test("runtime guard 允许链式 ShortcutValueRef 和 shortcut.when", () => {
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

test("runtime guard 拦截变量 DSL 运行期值的原生 if", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Variable Native If",
      workflow: (shortcut) => {
        const message = shortcut.variable("Message", "Hello");
        const updated = message.set("Updated");
        if (updated) {
          shortcut.showResult(updated);
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

test("runtime guard 拦截 if 结果在自身分支中引用", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Self Referenced If Result",
      workflow: (shortcut) => {
        const message = shortcut.text("Hello");
        const result = shortcut.if(shortcut.equals(message, "Hello"), {
          then: (shortcut) => {
            shortcut.showResult(result);
          },
        });
        shortcut.showResult(result);
      },
    });
  `);

  try {
    assert.throws(
      () => assertNoRuntimeSyntaxMisuse(file),
      /Do not reference an If result inside the same shortcut\.if\(\.\.\.\) branches/,
    );
  } finally {
    removeShortcutSource(file);
  }
});

test("runtime guard 拦截赋值形式的 if 结果在自身分支中引用", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Assigned If Result",
      workflow: (shortcut) => {
        const message = shortcut.text("Hello");
        let result;
        result = shortcut.if(shortcut.equals(message, "Hello"), {
          otherwise: (shortcut) => {
            shortcut.showResult(result);
          },
        });
      },
    });
  `);

  try {
    assert.throws(
      () => assertNoRuntimeSyntaxMisuse(file),
      /Do not reference an If result inside the same shortcut\.if\(\.\.\.\) branches/,
    );
  } finally {
    removeShortcutSource(file);
  }
});

test("runtime guard 允许之前的 if 结果在后续分支中引用", () => {
  const file = writeShortcutSource(`
    import { defineShortcut } from "shortcutsflow";

    export default defineShortcut({
      name: "Previous If Result",
      workflow: (shortcut) => {
        const message = shortcut.text("Hello");
        const previous = shortcut.if(shortcut.equals(message, "Hello"), {
          then: (shortcut) => {
            shortcut.showResult(message);
          },
        });

        const next = shortcut.if(shortcut.exists(previous), {
          then: (shortcut) => {
            shortcut.showResult(previous);
          },
        });

        shortcut.showResult(next);
      },
    });
  `);

  try {
    assert.doesNotThrow(() => assertNoRuntimeSyntaxMisuse(file));
  } finally {
    removeShortcutSource(file);
  }
});
