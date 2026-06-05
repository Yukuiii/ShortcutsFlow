#!/usr/bin/env node
import { basename } from "node:path";
import { runBuildCommand } from "./commands/build.js";
import { runCheckCommand } from "./commands/check.js";
import { runInspectCommand } from "./commands/inspect.js";
import { runSignCommand } from "./commands/sign.js";

/**
 * 执行 shortcutsflow CLI 入口。
 */
async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case "build":
      await runBuildCommand(rest);
      return;

    case "check":
      await runCheckCommand(rest);
      return;

    case "inspect":
      runInspectCommand(rest[0]);
      return;

    case "sign":
      runSignCommand(rest);
      return;

    default:
      printHelp();
  }
}

/**
 * 输出 CLI 使用说明。
 */
function printHelp(): void {
  const name = basename(process.argv[1] ?? "shortcutsflow");

  console.log(`Usage:
  ${name} build [shortcut.ts ...] [--out-dir dist]
  ${name} check [shortcut.ts ...]
  ${name} inspect <shortcut.shortcut>
  ${name} sign <input.shortcut> <output.shortcut>`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
