import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { compileShortcut } from "../../compiler/index.js";
import {
  loadShortcutsConfig,
  readConfiguredShortcutInputs,
} from "../config.js";
import { toKebabCase } from "../filename.js";
import { assertNoRuntimeSyntaxMisuse } from "../runtime-guard.js";
import { loadShortcutDefinition } from "../shortcut-module.js";

type BuildOptions = {
  inputs: string[];
  outDir?: string;
};

/**
 * 执行 build 命令。
 */
export async function runBuildCommand(args: string[]): Promise<void> {
  await build(parseBuildOptions(args));
}

/**
 * 解析 build 命令参数。
 */
function parseBuildOptions(args: string[]): BuildOptions {
  const outDirIndex = args.indexOf("--out-dir");
  const outDir = outDirIndex === -1 ? undefined : args[outDirIndex + 1] ?? "dist";
  const inputs = outDirIndex === -1
    ? args
    : args.filter((_, index) =>
      index !== outDirIndex &&
      index !== outDirIndex + 1
    );

  return {
    inputs,
    outDir,
  };
}

/**
 * 构建一个或多个未签名 shortcut、XML plist 和 JSON 调试文件。
 */
async function build(options: BuildOptions): Promise<void> {
  const targets = await resolveBuildTargets(options);

  for (const target of targets) {
    const inputPath = resolve(target.input);
    const outDir = resolve(target.outDir);
    assertNoRuntimeSyntaxMisuse(inputPath);
    const definition = await loadShortcutDefinition(inputPath);
    const result = compileShortcut(definition);
    const fileBase = toKebabCase(result.name);
    const xmlPath = join(outDir, `${fileBase}.unsigned.plist`);
    const jsonPath = join(outDir, `${fileBase}.unsigned.json`);
    const shortcutPath = join(outDir, `${fileBase}.unsigned.shortcut`);

    mkdirSync(outDir, {
      recursive: true,
    });
    writeFileSync(xmlPath, result.xml);
    writeFileSync(jsonPath, `${JSON.stringify(result.plist, null, 2)}\n`);
    execFileSync("plutil", [
      "-convert",
      "binary1",
      "-o",
      shortcutPath,
      xmlPath,
    ]);

    console.log(`Built ${result.name}`);
    console.log(`  ${xmlPath}`);
    console.log(`  ${jsonPath}`);
    console.log(`  ${shortcutPath}`);
  }
}

/**
 * 解析 build 命令的实际入口和输出目录。
 */
async function resolveBuildTargets(options: BuildOptions): Promise<Array<{
  input: string;
  outDir: string;
}>> {
  if (options.inputs.length > 0) {
    return options.inputs.map((input) => ({
      input,
      outDir: options.outDir ?? "dist",
    }));
  }

  const config = await loadShortcutsConfig("Usage: shortcutsflow build [shortcut.ts ...] [--out-dir dist]");
  const shortcuts = readConfiguredShortcutInputs(config);
  const outDir = options.outDir ?? config.outputDir ?? "dist";

  return shortcuts.map((input) => ({
    input,
    outDir,
  }));
}
