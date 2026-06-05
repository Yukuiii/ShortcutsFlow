import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";

export type ShortcutsConfig = {
  shortcuts?: string[];
  outputDir?: string;
};

/**
 * 从 shortcuts.config.ts 读取默认配置。
 */
export async function loadShortcutsConfig(usage: string): Promise<ShortcutsConfig> {
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
 * 从 shortcuts.config.ts 读取默认 shortcut 入口列表。
 */
export async function loadConfiguredShortcutInputs(usage: string): Promise<string[]> {
  const config = await loadShortcutsConfig(usage);

  return readConfiguredShortcutInputs(config);
}

/**
 * 从配置对象中读取非空 shortcut 入口列表。
 */
export function readConfiguredShortcutInputs(config: ShortcutsConfig): string[] {
  const shortcuts = config?.shortcuts ?? [];

  if (shortcuts.length === 0) {
    throw new Error("shortcuts.config.ts must define a non-empty shortcuts array.");
  }

  return shortcuts;
}
