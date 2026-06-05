import { resolve } from "node:path";
import { loadConfiguredShortcutInputs } from "../config.js";
import { assertNoRuntimeSyntaxMisuse } from "../runtime-guard.js";

/**
 * 执行 check 命令。
 */
export async function runCheckCommand(inputs: string[]): Promise<void> {
  const shortcutInputs = inputs.length > 0
    ? inputs
    : await loadConfiguredShortcutInputs("Usage: shortcutsflow check [shortcut.ts ...]");

  for (const input of shortcutInputs) {
    assertNoRuntimeSyntaxMisuse(resolve(input));
  }

  console.log(
    `Checked ${shortcutInputs.length} shortcut source file${shortcutInputs.length === 1 ? "" : "s"}.`,
  );
}
