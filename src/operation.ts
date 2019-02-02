export type TAction<T> = (...values: T[]) => T;

export class Operation<T> {

  constructor (
    public name: string,
    public action: TAction<T>,
    public arity = action.length,
  ) { }

  public eval (...values: T[]): T {
    return this.evaluator(this.action, ...values);
  }

  private evaluator (action: TAction<T>, ...values: T[]) {
    return action(...values);
  }

}
