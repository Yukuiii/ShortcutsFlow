import ts from "typescript";

export type RuntimeGuardIssue = {
  line: number;
  column: number;
  message: string;
};

export type RuntimeGuardContext = {
  sourceFile: ts.SourceFile;
  issues: RuntimeGuardIssue[];
  currentScope(): Set<string>;
  pushScope(): void;
  popScope(): void;
  isRuntimeIdentifier(node: ts.Node): boolean;
  addIssue(node: ts.Node, message: string): void;
};

/**
 * 创建一次 runtime guard 遍历共享的上下文。
 */
export function createRuntimeGuardContext(sourceFile: ts.SourceFile): RuntimeGuardContext {
  const issues: RuntimeGuardIssue[] = [];
  const scopes: Array<Set<string>> = [new Set()];
  const currentScope = (): Set<string> => scopes[scopes.length - 1] as Set<string>;

  return {
    sourceFile,
    issues,
    currentScope,
    pushScope(): void {
      scopes.push(new Set());
    },
    popScope(): void {
      scopes.pop();
    },
    isRuntimeIdentifier(node: ts.Node): boolean {
      return ts.isIdentifier(node) && scopes.some((scope) => scope.has(node.text));
    },
    addIssue(node: ts.Node, message: string): void {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));

      issues.push({
        line: position.line + 1,
        column: position.character + 1,
        message,
      });
    },
  };
}
