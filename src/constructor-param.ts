import ts, {SyntaxKind, TypeChecker} from "typescript";

function transformer(modifier: ts.Decorator, node: ts.ClassDeclaration, sourceFile: ts.SourceFile, checker: TypeChecker): ts.Expression[] {
  function resolveInjectableOrUndefined(id: ts.Identifier): ts.Expression {
    const symbol = checker.getSymbolAtLocation(id);
    if (!symbol) return ts.factory.createIdentifier('undefined');

    // 若是类（值意义的 Class）
    if (symbol.flags & ts.SymbolFlags.Class) return id;

    // 若解析到的是变量，看看是否包装类实例
    const decls = symbol.getDeclarations() ?? [];
    for (const d of decls) {
      if (ts.isVariableDeclaration(d) && d.initializer && ts.isCallExpression(d.initializer)) {
        const callee = d.initializer.expression.getText();
        if (['String','Number','Boolean','Object','Array','Function','Symbol'].includes(callee)) {
          return ts.factory.createIdentifier('undefined');
        }
      }
    }

    return ts.factory.createIdentifier('undefined');
  }
  const constructorNode = node.members.find(
    (member) => ts.isConstructorDeclaration(member)) as ts.ConstructorDeclaration | undefined;
  const params: ts.Expression[] = [];
  if (constructorNode) {
    constructorNode.parameters.forEach(param => {
      const t = param.type;
      // 无类型或非引用类型：使用 undefined
      if (!t || !ts.isTypeReferenceNode(t)) {
        params.push(ts.factory.createIdentifier('undefined'));
        return;
      }

      const tn = t.typeName;
      const id = ts.isIdentifier(tn) ? tn : (ts.isQualifiedName(tn) ? tn.right : undefined);
      if (!id) {
        params.push(ts.factory.createIdentifier('undefined'));
        return;
      }

      const text = id.getText(sourceFile);
      // 原始类型与包装类：使用 undefined
      if (['String','Number','Boolean','Object','Array','Function','Symbol',
           'string','number','boolean','object','any','unknown','void','symbol'].includes(text)) {
        params.push(ts.factory.createIdentifier('undefined'));
        return;
      }

      // 使用 TypeChecker 解析类型，只有真正的类才注入
      params.push(resolveInjectableOrUndefined(id));
    })
    // 期望返回单个参数：把所有参数聚合为一个数组字面量
    return [ts.factory.createArrayLiteralExpression(params)]
  }
  // 无构造参数时同样返回空数组字面量作为唯一入参
  return [ts.factory.createArrayLiteralExpression(params)];
}

export const config = [
  { kind: SyntaxKind.ClassDeclaration, name: 'constructorParam', transformer },
];
