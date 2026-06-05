import type { ShortcutDefinition } from "../core/types.js";
import { pathToFileURL } from "node:url";
import { tsImport } from "tsx/esm/api";

/**
 * 加载用户导出的快捷指令定义模块。
 */
export async function loadShortcutDefinition(inputPath: string): Promise<ShortcutDefinition> {
  const module = await tsImport(pathToFileURL(inputPath).href, {
    parentURL: import.meta.url,
  });
  const definition = module.default;

  if (!definition || typeof definition.workflow !== "function") {
    throw new Error(`Module must export default defineShortcut(...): ${inputPath}`);
  }

  return definition as ShortcutDefinition;
}
