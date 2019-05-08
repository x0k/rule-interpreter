interface IDictionary<T> {
  [key: string]: T
}

export type TExpression = any[]

export type TOperation = (...args: TExpression) => any

export type TOperations = IDictionary<TOperation>

type TAction = (args: TExpression) => (operation: TOperation) => any

type TActions = IDictionary<TAction>

function getType (element: any) {
  switch (typeof element === 'string' && element[0] || Array.isArray(element)) {
    case '$':
      return 'action'
    case '@':
      return 'function'
    case true:
      return 'array'
    default:
      return 'value'
  }
}

function reduce<T> (array: T[], reducer: (acc: T[], element: T) => T[]) {
  return array.reverse().reduce(reducer, [])
}

function buildActionReducer (actions: TActions, operations: TOperations) {
  const actionReducer = (data: TExpression, element: any): TExpression => {
    const type = getType(element)
    switch (type) {
      case 'action': {
        let i = 0
        let action: any = actions[element]
        const len = Math.min(2, data.length)
        while (i < len) {
          action = action(data[i++])
        }
        return [action, ...data.slice(len)]
      }
      case 'function': {
        return [operations[element], ...data]
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
  const prefixSetter = (dictionary: IDictionary<T>, key: string) => ({ ...dictionary, [prefix + key]: dictionary[key] })
  return Object.keys(dictionary).reduce(prefixSetter, {})
}

interface IOptions {
  actionsPrefix?: string
  operationsPrefix?: string
}

export function buildActionsBuilder (operations: TOperations, options: IOptions = {}) {
  const { actionsPrefix = '$', operationsPrefix = '@' } = options

  if (actionsPrefix === operationsPrefix) {
    throw new Error('Identical prefixes are not allowed')
  }

  const actions: TActions = {
    eval: (args) => (operation) => operation(...args),
    bind: (args) => (operation) => operation.bind(null, ...args),
    map: (args) => (operation) => args.map(operation),
    reduce: (args) => (operation) => args.reduce(operation),
    filter: (args) => (operation) => args.filter(operation),
    some: (args) => (operation) => args.some(operation),
    any: (args) => (operation) => args.every(operation)
  }

  const actionsWithPrefix = setPrefix(actions, actionsPrefix)

  const operationsWithPrefix = setPrefix(operations, operationsPrefix)

  const actionReducer = buildActionReducer(actionsWithPrefix, operationsWithPrefix)

  return (expression: TExpression) => reduce(expression, actionReducer)
}
