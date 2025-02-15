import ts, {Expression, SyntaxKind} from "typescript";

function transformer(modifier: ts.Decorator, node: ts.PropertyDeclaration, sourceFile: ts.SourceFile): ts.Expression[] {
    let type;
    if (
      node.type &&
      ts.isTypeReferenceNode(node.type) &&
      (type = node.type.getText(sourceFile)) &&
      ['String', "Number", "Boolean", "Object", "Array", "Function", "Symbol"].indexOf(type) === -1
    ) {
      return [node.type.typeName as ts.Identifier];
    }
    return [];
}

export const config = [
  { kind: SyntaxKind.PropertyDeclaration, name: 'autowired', transformer },
  { kind: SyntaxKind.PropertyDeclaration, name: 'reactiveAutowired', transformer },
];
