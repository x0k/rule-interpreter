import { IContext, TExpression } from './common'

export type TOperation = (...args: any[]) => any

export interface IOperations {
  [name: string]: TOperation
}

function buildEvaluator (context: IContext) {
  return (element: any) => typeof element === 'function' ? element(context) : element
}

function buildOperation (operation: TOperation, args: TExpression) {
  return (context: IContext) => operation(...args.map(buildEvaluator(context)))
}

export function operationReducer (name: string, data: TExpression, operations: IOperations) {
  const operation = operations[name]
  if (!operation) {
    throw new Error(`Can't find operation: "${name}"`)
  }
  const arity = operation.length
  switch (arity) {
    case 0:
      if (Array.isArray(data[0])) {
        return [ buildOperation(operation, data[0]), ...data.slice(1) ]
      }
      return [ buildOperation(operation, data) ]
    default:
      return [ buildOperation(operation, data.slice(0, arity)), ...data.slice(arity) ]
  }
}