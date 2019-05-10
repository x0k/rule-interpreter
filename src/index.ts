interface IDictionary<T> {
  [key: string]: T
}

export type TExpression = any[]

export type TOperation = (...args: TExpression) => any

export type TOperations = IDictionary<TOperation>

type TAction = (operation: TOperation) => (...args: TExpression) => any

type TActions = IDictionary<TAction>

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

function reduce<T> (array: T[], reducer: (acc: T[], element: T) => T[]) {
  return array.reverse().reduce(reducer, [])
}

function toExpression (element: any): TExpression {
  if (!Array.isArray(element)) {
    throw new Error(`Function haven't default args`)
  }
  return element
}

function buildActionReducer (actions: TActions, operations: TOperations) {
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
          const args = data[i++]
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

function setPrefix<T> (dictionary: IDictionary<T>, prefix: string) {
  const prefixSetter = (acc: IDictionary<T>, key: string) => ({ ...acc, [prefix + key]: dictionary[key] })
  return Object.keys(dictionary).reduce(prefixSetter, {})
}

interface IOptions {
  actionsPrefix?: string
  operationsPrefix?: string
}

function toOperation (action: any) : TOperation {
  if (!action || typeof action !== 'function') {
    throw new Error(`Invalid action argument: ${action}`)
  }
  return action
}

export function buildActionsBuilder (operations: TOperations, options: IOptions = {}) {
  const { actionsPrefix = '$', operationsPrefix = '@' } = options

  if (actionsPrefix === operationsPrefix) {
    throw new Error('Identical prefixes are not allowed')
  }

  const actions: TActions = {
    eval: (operation) => (...args) => operation(...args),
    map: (operation) => (...args) => args.map(operation),
    reduce: (operation) => (...args) => args.reduce(operation),
    filter: (operation) => (...args) => args.filter(operation),
    some: (operation) => (...args) => args.some(operation),
    any: (operation) => (...args) => args.every(operation),
    '|>': (operation) => (...args) => toOperation(args[0])(operation),
    '>>': (operation) => (...args) => {
      const action = toOperation(args[0])
      return (...data: TExpression) => action(operation(...data))
    }
  }

  const actionsWithPrefix = setPrefix(actions, actionsPrefix)

  const operationsWithPrefix = setPrefix(operations, operationsPrefix)

  const actionReducer = buildActionReducer(actionsWithPrefix, operationsWithPrefix)

  return (expression: TExpression) => reduce(expression, actionReducer)
}
