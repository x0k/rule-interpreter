import { TAction, TExpression } from './common'
import { IOperations, operationReducer } from './operation'
import { variableReducer } from './variable'

function getType (element: any) {
  if (Array.isArray(element)) {
    return 'array'
  }
  if (typeof element === 'string') {
    switch (element[0]) {
      case '@':
        return 'operation'
      case '%':
        return 'variable'
    }
  }
  return 'value'
}

function getName (nameWithPrefix: string) {
  return nameWithPrefix.slice(1)
}

function buildActionReducer (operations: IOperations) {
  return (data: TExpression, element: any) => {
    const type = getType(element)
    switch (type) {
      case 'array':
        return [ buildActions(element, operations), ...data ]
      case 'operation': {
        const name = getName(element)
        return operationReducer(name, data, operations)
      }
      case 'variable': {
        const name = getName(element)
        return variableReducer(name, data)
      }
      case 'value': {
        return [ element, ...data ]
      }
    }
  }
}

export function buildActions (expression: TExpression, operations: IOperations): TAction[] {
  const actionReducer = buildActionReducer(operations)
  return expression.reverse()
    .reduce(actionReducer, [])
};
