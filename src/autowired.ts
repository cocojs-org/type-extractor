import ts, {Expression, SyntaxKind, TypeChecker} from "typescript";

function transformer(modifier: ts.Decorator, node: ts.PropertyDeclaration, sourceFile: ts.SourceFile, checker?: TypeChecker): ts.Expression[] {
    if (!node.type || !ts.isTypeReferenceNode(node.type)) {
        return [];
    }

    const tn = node.type.typeName;
    const id = ts.isIdentifier(tn) ? tn : (ts.isQualifiedName(tn) ? tn.right : undefined);
    if (!id) {
        return [];
    }

    const text = id.getText(sourceFile);
    // 原始类型与包装类：不解析
    if (['String','Number','Boolean','Object','Array','Function','Symbol',
         'string','number','boolean','object','any','unknown','void','symbol'].includes(text)) {
        return [];
    }

    // 如果有 TypeChecker，使用它来验证类型
    if (checker) {
        const symbol = checker.getSymbolAtLocation(id);
        if (!symbol) return [];

        // 若是类（值意义的 Class）
        if (symbol.flags & ts.SymbolFlags.Class) {
            return [id];
        }

        // 若解析到的是变量，看看是否包装类实例
        const decls = symbol.getDeclarations() ?? [];
        for (const d of decls) {
            if (ts.isVariableDeclaration(d) && d.initializer && ts.isCallExpression(d.initializer)) {
                const callee = d.initializer.expression.getText();
                if (['String','Number','Boolean','Object','Array','Function','Symbol'].includes(callee)) {
                    return [];
                }
            }
        }

        return [];
    }

    // 没有 TypeChecker 时的回退逻辑：只允许帕斯卡命名的标识符
    if (/^[A-Z]/.test(text)) {
        return [id];
    }
    
    return [];
}

export const config = [
  { kind: SyntaxKind.PropertyDeclaration, name: 'autowired', transformer },
  { kind: SyntaxKind.PropertyDeclaration, name: 'reactiveAutowired', transformer },
];
