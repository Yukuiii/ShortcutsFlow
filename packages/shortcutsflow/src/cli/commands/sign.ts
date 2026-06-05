import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

/**
 * 执行 sign 命令。
 */
export function runSignCommand(args: string[]): void {
  const input = args[0];
  const output = args[1];

  if (!input || !output) {
    throw new Error("Usage: shortcutsflow sign <input.shortcut> <output.shortcut>");
  }

  execFileSync("shortcuts", [
    "sign",
    "--mode",
    "anyone",
    "--input",
    resolve(input),
    "--output",
    resolve(output),
  ], {
    stdio: "inherit",
  });
}
