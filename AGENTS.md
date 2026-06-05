# Repository Guidelines

## Project Structure & Module Organization

This is a Node.js 20+ TypeScript monorepo for ShortcutsFlow. Workspace packages live under `packages/`:

- `packages/shortcutsflow/`: the core DSL, compiler, plist helpers, and `shortcutsflow` CLI.
- `packages/create/`: the `create-shortcutsflow` project initializer.
- `tests/action/`: action-level DSL and compiler tests.
- `tests/create-shortcutsflow.test.ts`: scaffold template tests.
- `examples/`: sample shortcut definitions and generated output under `examples/dist/`.
- `scripts/`: repository automation, including version synchronization.

## Build, Test, and Development Commands

- `npm install`: install workspace dependencies.
- `npm run build`: run shortcut misuse checks, then build both packages with `tsc -b`.
- `npm run typecheck`: run project-reference TypeScript checks without test execution.
- `npm test`: build, then run all Node test runner suites.
- `npm run example:build`: generate the sample unsigned shortcut artifacts.
- `npm run example:inspect`: inspect the generated sample `.shortcut`.
- `npm run clean`: remove package `dist/` directories and `examples/dist/`.

## Coding Style & Naming Conventions

Use TypeScript ESM with explicit `.js` import specifiers in source files. Keep indentation at two spaces and prefer small functions with narrow responsibilities. Public functions and classes should have concise doc comments; match the existing Chinese comment style in TypeScript files. Name action tests after the DSL action, for example `tests/action/get-contents-of-url.test.ts`.

## Testing Guidelines

Tests use Node’s built-in test runner through `tsx --test`. Add focused tests whenever DSL behavior, compiler output, runtime guard rules, or scaffold templates change. Prefer asserting generated Shortcuts plist parameters over snapshotting entire files. Run `npm test` before handing off changes.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects such as `Add ...`, `Update ...`, and `Refactor ...`; keep subjects specific and under one line. For PRs, include a concise summary, affected packages, verification commands, and any generated artifact or CLI behavior changes. Link issues when applicable.

## Architecture Notes

The main flow is `Builder DSL -> ShortcutNode AST -> WorkflowAction[] -> WorkflowPlist -> XML/binary .shortcut`. Keep compiler changes localized: action metadata and parameter compilation belong in the compiler registry, value references in value compilation helpers, and control-flow flattening in the main compiler.
