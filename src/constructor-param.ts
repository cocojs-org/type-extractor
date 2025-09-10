import ts, {SyntaxKind} from "typescript";

function transformer(modifier: ts.Decorator, node: ts.ClassDeclaration, sourceFile: ts.SourceFile): ts.Expression[] {
  const constructorNode = node.members.find(
    (member) => ts.isConstructorDeclaration(member)) as ts.ConstructorDeclaration | undefined;
  const params: ts.Identifier[] = [];
  if (constructorNode) {
    constructorNode.parameters.forEach(param => {
      params.push((param.type as ts.TypeReferenceNode).typeName as ts.Identifier);
    })
    return params.map(p => {
      return ts.factory.createArrayLiteralExpression([p])
    })
  }
  return params;
}

export const config = [
  { kind: SyntaxKind.ClassDeclaration, name: 'constructorParam', transformer },
];
