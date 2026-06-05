#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const rootPackagePath = join(rootDir, "package.json");
const lockfilePath = join(rootDir, "package-lock.json");
const workspacePackagePaths = [
  join(rootDir, "packages/shortcutsflow/package.json"),
  join(rootDir, "packages/create/package.json"),
];

/**
 * 同步根包版本到所有工作区包和锁文件。
 */
function main() {
  const rootVersion = readPackageVersion(rootPackagePath);
  const changedFiles = [];

  for (const packagePath of workspacePackagePaths) {
    if (syncPackageVersion(packagePath, rootVersion)) {
      changedFiles.push(packagePath);
    }
  }

  if (syncLockfileVersion(lockfilePath, rootVersion)) {
    changedFiles.push(lockfilePath);
  }

  if (changedFiles.length > 0) {
    stageVersionFiles([rootPackagePath, ...changedFiles]);
  }
}

/**
 * 读取 package.json 中的版本号。
 */
function readPackageVersion(packagePath) {
  const packageJson = readJsonFile(packagePath);

  if (!packageJson.version) {
    throw new Error(`Missing version in ${packagePath}`);
  }

  return packageJson.version;
}

/**
 * 将指定 package.json 的版本更新为目标版本。
 */
function syncPackageVersion(packagePath, version) {
  const packageJson = readJsonFile(packagePath);

  if (packageJson.version === version) {
    return false;
  }

  packageJson.version = version;
  writeJsonFile(packagePath, packageJson);
  return true;
}

/**
 * 将 package-lock.json 中的根包与工作区版本更新为目标版本。
 */
function syncLockfileVersion(lockfilePath, version) {
  const lockfile = readJsonFile(lockfilePath);

  let changed = false;

  if (lockfile.version !== version) {
    lockfile.version = version;
    changed = true;
  }

  const rootPackage = lockfile.packages?.[""];
  if (rootPackage && rootPackage.version !== version) {
    rootPackage.version = version;
    changed = true;
  }

  for (const workspaceKey of ["packages/shortcutsflow", "packages/create"]) {
    const workspacePackage = lockfile.packages?.[workspaceKey];

    if (workspacePackage && workspacePackage.version !== version) {
      workspacePackage.version = version;
      changed = true;
    }
  }

  if (changed) {
    writeJsonFile(lockfilePath, lockfile);
  }

  return changed;
}

/**
 * 读取 JSON 文件。
 */
function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

/**
 * 写入格式化后的 JSON 文件。
 */
function writeJsonFile(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * 将版本相关文件加入 git 暂存区。
 */
function stageVersionFiles(filePaths) {
  execFileSync("git", ["add", "--", ...filePaths], {
    stdio: "inherit",
  });
}

main();
