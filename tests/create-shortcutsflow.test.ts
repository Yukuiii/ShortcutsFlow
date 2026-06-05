import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

/**
 * 创建临时目录用于脚手架输出测试。
 */
function createTempRoot(): string {
  return mkdtempSync(join(tmpdir(), "shortcutsflow-create-"));
}

/**
 * 删除临时测试目录。
 */
function removeTempRoot(root: string): void {
  rmSync(root, {
    recursive: true,
    force: true,
  });
}

test("create-shortcutsflow 生成可用的开发者项目模板", () => {
  const root = createTempRoot();
  const project = join(root, "demo-shortcut");

  try {
    execFileSync("node", [
      "packages/create/dist/main.js",
      project,
    ], {
      cwd: process.cwd(),
      stdio: "pipe",
    });

    const packageJson = JSON.parse(readFileSync(join(project, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const createPackageJson = JSON.parse(readFileSync("packages/create/package.json", "utf8")) as {
      version: string;
    };

    assert.equal(packageJson.scripts.build, "shortcutsflow build");
    assert.equal(packageJson.scripts.check, "shortcutsflow check");
    assert.equal(packageJson.scripts.inspect, "shortcutsflow inspect dist/basic-shortcut.unsigned.shortcut");
    assert.equal(packageJson.scripts.sign, "shortcutsflow sign dist/basic-shortcut.unsigned.shortcut dist/basic-shortcut.shortcut");
    assert.equal(packageJson.dependencies.shortcutsflow, `^${createPackageJson.version}`);
    assert.equal(packageJson.devDependencies.typescript, "^5.8.0");
    assert.equal(existsSync(join(project, "shortcuts.config.ts")), true);
    assert.equal(existsSync(join(project, "src/shortcut.ts")), true);
  } finally {
    removeTempRoot(root);
  }
});
