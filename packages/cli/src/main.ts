#!/usr/bin/env node
import type { ShortcutDefinition } from "@shortcutsflow/core";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";
import { assertNoRuntimeSyntaxMisuse } from "./runtime-guard.js";

type BuildOptions = {
  inputs: string[];
  outDir?: string;
};

type ShortcutsConfig = {
  shortcuts?: string[];
  outputDir?: string;
};

/**
 * 执行 shortcutsflow CLI 入口。
 */
async function main(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  switch (command) {
    case "build":
      await build(parseBuildOptions(rest));
      return;

    case "check":
      await check(rest);
      return;

    case "inspect":
      inspect(rest[0]);
      return;

    case "sign":
      sign(rest);
      return;

    default:
      printHelp();
  }
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
  const { compileShortcut } = await import("@shortcutsflow/compiler");

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

/**
 * 检查一个或多个 shortcut 源文件是否误用了原生 TypeScript 运行期语法。
 */
async function check(inputs: string[]): Promise<void> {
  const shortcutInputs = inputs.length > 0 ? inputs : await loadConfiguredShortcutInputs();

  for (const input of shortcutInputs) {
    assertNoRuntimeSyntaxMisuse(resolve(input));
  }

  console.log(
    `Checked ${shortcutInputs.length} shortcut source file${shortcutInputs.length === 1 ? "" : "s"}.`,
  );
}

/**
 * 从 shortcuts.config.ts 读取默认 shortcut 入口列表。
 */
async function loadConfiguredShortcutInputs(): Promise<string[]> {
  const config = await loadShortcutsConfig("Usage: shortcutsflow check [shortcut.ts ...]");

  return readConfiguredShortcutInputs(config);
}

/**
 * 从 shortcuts.config.ts 读取默认配置。
 */
async function loadShortcutsConfig(usage: string): Promise<ShortcutsConfig> {
  const configPath = resolve("shortcuts.config.ts");

  if (!existsSync(configPath)) {
    throw new Error(usage);
  }

  const module = await tsImport(pathToFileURL(configPath).href, {
    parentURL: import.meta.url,
  });
  const config = module.default as ShortcutsConfig | undefined;
  return config ?? {};
}

/**
 * 从配置对象中读取非空 shortcut 入口列表。
 */
function readConfiguredShortcutInputs(config: ShortcutsConfig): string[] {
  const shortcuts = config?.shortcuts ?? [];

  if (shortcuts.length === 0) {
    throw new Error("shortcuts.config.ts must define a non-empty shortcuts array.");
  }

  return shortcuts;
}

/**
 * 加载用户导出的快捷指令定义模块。
 */
async function loadShortcutDefinition(inputPath: string): Promise<ShortcutDefinition> {
  const module = await tsImport(pathToFileURL(inputPath).href, {
    parentURL: import.meta.url,
  });
  const definition = module.default;

  if (!definition || typeof definition.workflow !== "function") {
    throw new Error(`Module must export default defineShortcut(...): ${inputPath}`);
  }

  return definition as ShortcutDefinition;
}

/**
 * 输出 plist 顶层摘要和 action 统计。
 */
function inspect(input: string | undefined): void {
  if (!input) {
    throw new Error("Missing shortcut file.");
  }

  const inputPath = resolve(input);
  const json = execFileSync("plutil", [
    "-convert",
    "json",
    "-o",
    "-",
    inputPath,
  ], {
    encoding: "utf8",
  });
  const plist = JSON.parse(json) as {
    WFWorkflowActions?: Array<{
      WFWorkflowActionIdentifier?: string;
    }>;
  };
  const actions = plist.WFWorkflowActions ?? [];
  const counts = new Map<string, number>();

  for (const action of actions) {
    const identifier = action.WFWorkflowActionIdentifier ?? "(unknown)";
    counts.set(identifier, (counts.get(identifier) ?? 0) + 1);
  }

  console.log(`File: ${inputPath}`);
  console.log(`Actions: ${actions.length}`);
  console.log("Top action identifiers:");

  for (const [identifier, count] of [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${String(count).padStart(4, " ")} ${identifier}`);
  }
}

/**
 * 调用 macOS Shortcuts CLI 对未签名文件签名。
 */
function sign(args: string[]): void {
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

/**
 * 将快捷指令名称转换为稳定文件名。
 */
function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
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
