interface IDictionary<T> {
  [key: string]: T
}

export type TExpression = any[]

export type TOperation = (...args: TExpression) => any

export type TOperations = IDictionary<TOperation>

type TAction = (args: TExpression, operation: TOperation) => any

type TActions = IDictionary<TAction>

type TNamedAction = (args: TExpression, name: string) => any

type TNamedActions = IDictionary<TNamedAction>

function getType (element: any) {
  return typeof element === 'string' && element[0] === '$' ? 'action' : 'value'
}

function getName (nameWithPrefix: string) {
  return nameWithPrefix.slice(1)
}

function buildActionReducer (actions: TNamedActions) {
  return (data: TExpression, element: any) => {
    const type = getType(element)
    switch (type) {
      case 'action':
        const name = getName(element)
        const args = data.slice(0, 2)
        return [ actions[name](args[0], args[1]), ...data.slice(2) ]
      case 'value':
        return [ element, ...data ]
    }
  }
}

export function buildActionsBuilder (operations: TOperations) {
  const actions: TActions = {
    eval: (args, operation) => operation(...args),
    bind: (args, operation) => operation.bind(null, ...args),
    map: (args, operation) => args.map(operation),
    reduce: (args, operation) => args.reduce(operation),
    filter: (args, operation) => args.filter(operation),
    some: (args, operation) => args.some(operation),
    any: (args, operation) => args.every(operation)
  }

  function withOperation (acc: TNamedActions, action: string) {
    return { ...acc, [action]: (args: TExpression, operation: string) => actions[action](args, operations[operation]) }
  }

  const curriedActions: TNamedActions = Object.keys(actions).reduce(withOperation, {})

  const actionReducer = buildActionReducer(curriedActions)

  return (expression: TExpression) => expression.reverse().reduce(actionReducer)
}
