import { TExpression, TOperations, TActions } from 'types'

import { reduce } from './reduce'

function toType (element: any) {
  return (typeof element === 'string' && element[0]) ||
    (Array.isArray(element) && 'array') ||
    typeof element
}

function getType (element: any) {
  const type = toType(element)
  switch (type) {
    case '$':
      return 'action'
    case '@':
      return 'function'
    case 'array':
      return type
    default:
      return 'value'
  }
}

function toExpression (element: any): TExpression {
  if (!Array.isArray(element)) {
    throw new Error(`Function haven't default args`)
  }
  return element
}

export function buildActionReducer (actions: TActions, operations: TOperations) {
  const actionReducer = (data: TExpression, element: any): TExpression => {
    const type = getType(element)
    switch (type) {
      case 'action': {
        let i = 0
        let action: any = actions[element]
        if (data.length) {
          action = action(data[i++])
        }
        if (data.length > 1) {
          const args = toExpression(data[i++])
          action = action(...args)
        }
        return [action, ...data.slice(i)]
      }
      case 'function': {
        const defaultArgs = toExpression(data[0])
        const operation = (...args: TExpression) => operations[element].apply(null, defaultArgs.concat(args))
        return [operation, ...data.slice(1)]
      }
      case 'array':
        return [reduce(element, actionReducer), ...data]
      case 'value':
        return [element, ...data]
    }
  }
  return actionReducer
}
