/**
 * 编译过程中记录 action output 引用所需的共享上下文。
 */
export type CompileContext = {
  outputs: Map<string, {
    outputName: string;
    uuid: string;
  }>;
};

/**
 * 创建一次 shortcut 编译使用的上下文对象。
 */
export function createCompileContext(): CompileContext {
  return {
    outputs: new Map(),
  };
}
