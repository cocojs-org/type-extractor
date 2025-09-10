const { transpile } = require('../_helper/transpile');

describe('成功解析的情况', () => {
  test('return identifier', async () => {
    const source = `
@constructorParam()
class A {
  constructor(service: Service) {}
}`;
    const decoratorExp = '@constructorParam([Service])';

    const output = transpile(source);
    expect(output).toContain(decoratorExp);
  });

  test('构造函数参数类型是自己的情况', async () => {
    const source = `
@constructorParam()
class A {
  constructor(service: A) {}
}`;
    const decoratorExp = '@constructorParam([A])';

    const output = transpile(source);
    expect(output).toContain(decoratorExp);
  });

  xtest('return new 表达式', async () => {
    const source = `
    class A {
      @component()
      hello() {
        return new Service();
      }
    }`;
    const decoratorExp = '@component({ value: Service })';

    const output = transpile(source);
    expect(output).toContain(decoratorExp);
  });

  xtest('设置了Scope', async () => {
    const source = `
function autowired() {}
class A {
  @component(Component.Scope.Singleton)
  hello() {
    const s = new Service();
    return s;
  }
}
`;
    const decoratorExp = '@component({ value: Service, scope: Component.Scope.Singleton })';

    const output = transpile(source);
    expect(output).toContain(decoratorExp);
  });

});
