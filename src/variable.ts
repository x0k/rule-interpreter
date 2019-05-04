import { IContext, TExpression } from './common'

function buildVariable (name: string) {
  return (context: IContext) => context[name]
}

export function variableReducer (name: string, data: TExpression) {
  return [ buildVariable(name), ...data ]
}