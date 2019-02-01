import { operations, Handler, Operation, IOperations } from './operations';
import { buildHandler } from './builder';
import { Getter } from './getter';

export interface IHandlerBuilder {
  toHandler: (expression: any[]) => () => any;
}

export class Interpreter implements IHandlerBuilder {

  private operations: IOperations = { ...operations };
  private getter: Getter;

  constructor (private input: any = {}, private output: any = [], getter?: Getter) {
    this.getter = getter || ((array: any[], index: number) => {
      const el = array[index];
      if (el in this.operations) {
        return this.operations[el];
      }
      return el;
    });
  }

  public toHandler (handlerFlow: any[]): () => any {
    return buildHandler(handlerFlow, this.getter).bind(this, this.input, this.output);
  }

  public addOperation (name: string, operation: Operation) {
    this.operations[name] = operation;
  }

}
