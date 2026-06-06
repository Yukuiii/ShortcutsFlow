# Repository Guidelines

## Project Structure & Module Organization

Node.js 20+ TypeScript monorepo with workspaces in `packages/`:

- `packages/shortcutsflow/`: public DSL, internal compiler, plist helpers, and `shortcutsflow` CLI.
- `packages/create/`: the `create-shortcutsflow` project initializer.
- `tests/action/`: action-level DSL and compiler tests.
- `tests/create-shortcutsflow.test.ts`: scaffold template tests.
- `examples/`: sample shortcuts and generated `examples/dist/` output.
- `scripts/`: repository automation such as version synchronization.

## Build, Test, and Development Commands

- `npm install`: install workspace dependencies.
- `npm run build`: run shortcut checks, then build packages with `tsc -b`.
- `npm run typecheck`: run project-reference TypeScript checks.
- `npm test`: build, then run all Node test suites.
- `npm run example:build`: generate sample unsigned shortcut artifacts.
- `npm run example:inspect`: inspect the sample `.shortcut`.
- `npm run clean`: remove package `dist/` and `examples/dist/`.

## Coding Style & Naming Conventions

Use TypeScript ESM with explicit `.js` import specifiers. Keep two-space indentation and small functions. Public functions/classes need concise doc comments; match the existing Chinese comment style. Name action tests after the DSL action, for example `tests/action/get-contents-of-url.test.ts`.

## Testing Guidelines

Tests use Node’s built-in runner through `tsx --test`. Add focused tests for DSL behavior, compiler output, runtime guard rules, or scaffold templates. Prefer asserting generated plist parameters over snapshots. Run `npm test` before handoff.

## Commit & Pull Request Guidelines

Use Conventional Commits. The body is required; do not create subject-only commits.
Commits must be atomic: each commit should contain one coherent change set and must not include unrelated edits.

```txt
type(scope): short imperative description

Explain what changed and why.

Fixes #123
```

Allowed types: `feat`, `fix`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `perf`. Scope is optional, for example `refactor(dsl): expose only public DSL API`. Use `!` and `BREAKING CHANGE:` for incompatible public API changes.

For PRs, include a summary, affected packages, verification commands, and CLI or generated artifact changes.

## Architecture Notes

Main library flow in `packages/shortcutsflow/src`: `Builder DSL -> ShortcutNode AST -> WorkflowAction[] -> WorkflowPlist -> XML/binary .shortcut`. Only the root `shortcutsflow` DSL is public.

- `actions/`: DSL layer. `builder.ts` executes the user workflow at build time and collects AST nodes; `nodes.ts` is internal; `types.ts` defines user-facing builder types.
- `core/`: domain model layer for shortcut metadata, value references, conditions, and icon helpers. Keep plist-specific details out of this layer.
- `compiler/`: transformation layer. `compile.ts` walks AST nodes; `action-compilers.ts` maps DSL actions to Shortcuts identifiers and parameters.
- `plist/`: serialization layer for XML plist output.
- `cli/`: command layer. `main.ts` dispatches commands; `commands/` contains `build`, `check`, `inspect`, and `sign`.
