import { operations, Handler, Operation, IOperations } from './operations';
import { buildHandler } from './builder';

export interface IHandlerBuilder {
  toHandler: (expression: any[]) => Handler;
}

export class Interpreter implements IHandlerBuilder {

  private operations: IOperations;

  constructor (private input: any, private output: any) {
    this.operations = { ...operations };
  }

  public toHandler (handlerFlow: any[]): () => any {
    return buildHandler(this.operations, handlerFlow).bind(this, this.input, this.output);
  }

  public addOperation (name: string, operation: Operation) {
    this.operations[name] = operation;
  }

}
