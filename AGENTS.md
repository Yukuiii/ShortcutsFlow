# Repository Guidelines

## Project Structure & Module Organization

This is a Node.js 20+ TypeScript monorepo with workspaces under `packages/`:

- `packages/shortcutsflow/`: public DSL, internal compiler, plist helpers, and `shortcutsflow` CLI.
- `packages/create/`: the `create-shortcutsflow` project initializer.
- `tests/action/`: action-level DSL and compiler tests.
- `tests/create-shortcutsflow.test.ts`: scaffold template tests.
- `examples/`: sample shortcut definitions and generated output under `examples/dist/`.
- `scripts/`: repository automation, including version synchronization.

## Build, Test, and Development Commands

- `npm install`: install workspace dependencies.
- `npm run build`: run shortcut misuse checks, then build both packages with `tsc -b`.
- `npm run typecheck`: run project-reference TypeScript checks.
- `npm test`: build, then run all Node test runner suites.
- `npm run example:build`: generate the sample unsigned shortcut artifacts.
- `npm run example:inspect`: inspect the generated sample `.shortcut`.
- `npm run clean`: remove package `dist/` directories and `examples/dist/`.

## Coding Style & Naming Conventions

Use TypeScript ESM with explicit `.js` import specifiers. Keep two-space indentation and prefer small functions. Public functions and classes should have concise doc comments; match the existing Chinese comment style in TypeScript files. Name action tests after the DSL action, for example `tests/action/get-contents-of-url.test.ts`.

## Testing Guidelines

Tests use Node’s built-in test runner through `tsx --test`. Add focused tests whenever DSL behavior, compiler output, runtime guard rules, or scaffold templates change. Prefer asserting generated plist parameters over snapshotting entire files. Run `npm test` before handoff.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects such as `Add ...`, `Update ...`, and `Refactor ...`; keep subjects specific and one line. For PRs, include a summary, affected packages, verification commands, and generated artifact or CLI behavior changes.

## Architecture Notes

The main library lives in `packages/shortcutsflow/src` and follows this flow: `Builder DSL -> ShortcutNode AST -> WorkflowAction[] -> WorkflowPlist -> XML/binary .shortcut`. Only the root `shortcutsflow` DSL is public.

- `actions/`: DSL layer. `builder.ts` executes the user workflow at build time and collects AST nodes; `nodes.ts` is internal; `types.ts` defines user-facing builder types.
- `core/`: domain model layer for shortcut metadata, value references, conditions, and icon helpers. Keep plist-specific details out of this layer.
- `compiler/`: transformation layer. `compile.ts` walks AST nodes and flattens control flow; `action-compilers.ts` maps DSL actions to Shortcuts identifiers and parameters; `values.ts` and `dictionary.ts` encode inputs.
- `plist/`: serialization layer for XML plist output.
- `cli/`: command layer. `main.ts` dispatches commands; `commands/` contains `build`, `check`, `inspect`, and `sign`.
