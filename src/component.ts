import ts, {SyntaxKind, TypeChecker} from "typescript";

function transformer(modifier: ts.Decorator, node: ts.MethodDeclaration, sourceFile: ts.SourceFile, checker?: TypeChecker): ts.Expression[] {
    const decoratorExpression = modifier.expression as ts.CallExpression;
    const scopeArg = decoratorExpression.arguments?.[0];
    
    // 从方法的返回类型获取类型信息
    let typeIdentifier: ts.Identifier | undefined;
    
    if (node.type && ts.isTypeReferenceNode(node.type)) {
        const tn = node.type.typeName;
        const id = ts.isIdentifier(tn) ? tn : (ts.isQualifiedName(tn) ? tn.right : undefined);
        
        if (id) {
            const text = id.getText(sourceFile);
            // 原始类型与包装类：不解析
            if (['String','Number','Boolean','Object','Array','Function','Symbol',
                 'string','number','boolean','object','any','unknown','void','symbol'].includes(text)) {
                // 不设置 typeIdentifier，保持为 undefined
            } else {
                // 如果有 TypeChecker，使用它来验证类型
                if (checker) {
                    const symbol = checker.getSymbolAtLocation(id);
                    if (symbol && (symbol.flags & ts.SymbolFlags.Class)) {
                        typeIdentifier = id;
                    }
                } else {
                    // 没有 TypeChecker 时的回退逻辑：只允许帕斯卡命名的标识符
                    if (/^[A-Z]/.test(text)) {
                        typeIdentifier = id;
                    }
                }
            }
        }
    }
    
    // 创建参数数组
    let argumentsArray = [];
    if (typeIdentifier || scopeArg) {
        const propType = typeIdentifier ? [ts.factory.createPropertyAssignment('value', typeIdentifier)] : [];
        const propScope = scopeArg ? [ts.factory.createPropertyAssignment('scope', scopeArg)] : [];
        argumentsArray = [ts.factory.createObjectLiteralExpression([...propType, ...propScope])];
    }
    
    return argumentsArray;
}

export const config = [{ name: 'component', kind: SyntaxKind.MethodDeclaration, transformer }];
