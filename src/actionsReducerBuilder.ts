import { TExpression, TOperations, TOperation } from 'types'

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

function functionReducer (operation: TOperation, data: TExpression) {
  const defaultArgs = toExpression(data[0])
  const operationWrapper = (...args: TExpression) => operation.apply(null, defaultArgs.concat(args))
  return [operationWrapper, ...data.slice(1)]
}

function getFunctions (data: TExpression) {
  const functions = data.slice(0, 2)
  if (functions.every(fn => typeof fn === 'function')) {
    return functions
  }
  throw new Error(`Arguments must be functions`)
}

function actionReducer (action: string, data: TExpression) {
  switch (action) {
    case '>>': {
      const [ f, g ] = getFunctions(data)
      const composition = (...data: TExpression) => g(f(...data))
      return [ composition, ...data.slice(2) ]
    }
    default:
      throw new Error(`Unknown action: ${action}`)
  }
}

export function buildActionsReducer (actionsPrefix: string, operations: TOperations) {
  const actionsReducer = (data: TExpression, element: any): TExpression => {
    const type = getType(element)
    switch (type) {
      case 'action': {
        const action = element.replace(actionsPrefix, '')
        return actionReducer(action, data)
      }
      case 'function':
        return functionReducer(operations[element], data)
      case 'array':
        return [element.reduceRight(actionsReducer, []), ...data]
      case 'value':
        return [element, ...data]
    }
  }
  return actionsReducer
}
