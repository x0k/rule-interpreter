export type TExpression = any[]

export interface IContext {
  [name: string]: any
}

export type TAction = (context: IContext) => any
