import ts from "typescript";

/**
 * 判断节点是否是拥有函数体的函数节点。
 */
export function isFunctionLikeWithBody(node: ts.Node): boolean {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  ) && node.body !== undefined;
}

/**
 * 查找指定标识符的真实引用位置。
 */
export function findIdentifierReference(root: ts.Node, name: string): ts.Identifier | undefined {
  let reference: ts.Identifier | undefined;

  const visit = (node: ts.Node): void => {
    if (reference) {
      return;
    }

    if (isFunctionLikeWithBody(node) && functionLikeShadowsName(node, name)) {
      return;
    }

    if (ts.isBlock(node) && blockDeclaresName(node, name)) {
      return;
    }

    if (bindingDeclarationDeclaresName(node, name)) {
      return;
    }

    if (ts.isIdentifier(node) && node.text === name && isIdentifierReference(node)) {
      reference = node;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(root);
  return reference;
}

/**
 * 去掉不影响语义判断的表达式包装。
 */
export function unwrapExpression(node: ts.Expression): ts.Expression {
  let current = node;

  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isTypeAssertionExpression(current) ||
    ts.isNonNullExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

/**
 * 判断函数节点是否声明了同名局部绑定。
 */
function functionLikeShadowsName(node: ts.Node, name: string): boolean {
  if (
    !ts.isFunctionDeclaration(node) &&
    !ts.isFunctionExpression(node) &&
    !ts.isArrowFunction(node) &&
    !ts.isMethodDeclaration(node) &&
    !ts.isConstructorDeclaration(node) &&
    !ts.isGetAccessorDeclaration(node) &&
    !ts.isSetAccessorDeclaration(node)
  ) {
    return false;
  }

  if (
    (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
    node.name?.text === name
  ) {
    return true;
  }

  return node.parameters.some((parameter: ts.ParameterDeclaration) =>
    bindingNameMatches(parameter.name, name)
  );
}

/**
 * 判断代码块的直接语句是否声明了同名局部绑定。
 */
function blockDeclaresName(block: ts.Block, name: string): boolean {
  return block.statements.some((statement) => {
    if (ts.isVariableStatement(statement)) {
      return statement.declarationList.declarations.some((declaration) =>
        bindingNameMatches(declaration.name, name)
      );
    }

    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      return statement.name?.text === name;
    }

    return false;
  });
}

/**
 * 判断声明节点是否声明了指定绑定名。
 */
function bindingDeclarationDeclaresName(node: ts.Node, name: string): boolean {
  return (
    (ts.isVariableDeclaration(node) || ts.isParameter(node) || ts.isBindingElement(node)) &&
    bindingNameMatches(node.name, name)
  );
}

/**
 * 判断绑定名或解构绑定中是否包含指定名称。
 */
function bindingNameMatches(bindingName: ts.BindingName, name: string): boolean {
  if (ts.isIdentifier(bindingName)) {
    return bindingName.text === name;
  }

  return bindingName.elements.some((element) =>
    !ts.isOmittedExpression(element) && bindingNameMatches(element.name, name)
  );
}

/**
 * 判断标识符是否是表达式中的读取引用。
 */
function isIdentifierReference(node: ts.Identifier): boolean {
  const parent = node.parent;

  if (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isPropertyDeclaration(parent) && parent.name === node) ||
    (ts.isVariableDeclaration(parent) && parent.name === node) ||
    (ts.isParameter(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) && parent.name === node) ||
    (ts.isFunctionDeclaration(parent) && parent.name === node) ||
    (ts.isFunctionExpression(parent) && parent.name === node) ||
    (ts.isClassDeclaration(parent) && parent.name === node) ||
    (ts.isImportSpecifier(parent) && parent.name === node)
  ) {
    return false;
  }

  return true;
}
