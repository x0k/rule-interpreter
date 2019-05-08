interface IDictionary<T> {
  [key: string]: T
}

export type TExpression = any[]

export type TOperation = (...args: TExpression) => any

export type TOperations = IDictionary<TOperation>

type TAction = (args: TExpression) => (operation: TOperation) => any

type TActions = IDictionary<TAction>

function getType (element: any) {
  switch (typeof element === 'string' && element[0]) {
    case '$':
      return 'action'
    case '@':
      return 'function'
    default:
      return 'value'
  }
}

function buildActionReducer (actions: TActions, operations: TOperations) {
  return (data: TExpression, element: any) => {
    const type = getType(element)
    switch (type) {
      case 'action': {
        let i = 0
        let action: any = actions[element]
        const len = Math.min(2, data.length)
        while (i < len) {
          action = action(data[i++])
        }
        return [ action, ...data.slice(2) ]
      }
      case 'function': {
        return [ operations[element], ...data ]
      }
      case 'value':
        return [element, ...data]
    }
  }
}

function buildPrefixSetter<T> (dictionary: IDictionary<T>, prefix: string) {
  return (acc: IDictionary<T>, key: string) => ({ ...acc, [prefix + key]: dictionary[key] })
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

  const actionsWithPrefix = Object.keys(actions).reduce(buildPrefixSetter(actions, actionsPrefix), {})

  const operationsWithPrefix = Object.keys(operations).reduce(buildPrefixSetter(operations, operationsPrefix), {})

  const actionReducer = buildActionReducer(actionsWithPrefix, operationsWithPrefix)

  return (expression: TExpression) => expression.reverse().reduce(actionReducer, [])
}
