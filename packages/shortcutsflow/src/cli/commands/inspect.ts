import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

/**
 * 执行 inspect 命令。
 */
export function runInspectCommand(input: string | undefined): void {
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
