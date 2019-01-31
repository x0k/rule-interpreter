export type Handler = (input: any, output: any) => any;

export type Operation = (...values: Handler[]) => Handler;

export interface IOperations {
  [name: string]: Operation;
}

export const operations: IOperations = {
  '+': (a: Handler, ...b: Handler[]) => (input: any, output: any) => b.reduce((acc, val) => acc + val(input, output), a(input, output)),
  '-': (a: Handler, ...b: Handler[]) => (input: any, output: any) => b.reduce((acc, val) => acc - val(input, output), a(input, output)),
  '/': (a: Handler, ...b: Handler[]) => (input: any, output: any) => b.reduce((acc, val) => acc / val(input, output), a(input, output)),
  '*': (a: Handler, ...b: Handler[]) => (input: any, output: any) => b.reduce((acc, val) => acc * val(input, output), a(input, output)),
  '=': (a: Handler, ...b: Handler[]) => (input: any, output: any) => b.reduce((acc, val) => acc === val(input, output) ? acc : false, a(input, output)),
  '%': (a: Handler, ...b: Handler[]) => (input: any, output: any) => b.reduce((acc, val) => acc % val(input, output), a(input, output)),
  'not': (operand: Handler) => (input: any, output: any) => !operand(input, output),
  'and': (...list: Handler[]) => (input: any, output: any) => {
    const len = list.length;
    let i = 0;
    let result;
    while (i < len && (result = list[i](input, output))) {
      i++;
    }
    return i === len ? result : false;
  },
  'or': (...list: Handler[]) => (input: any, output: any) => {
    for (const item of list) {
      const val = item(input, output);
      if (val) {
        return val;
      }
    }
    return false;
  },
};
