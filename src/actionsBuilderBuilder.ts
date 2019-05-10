import {
  IDictionary,
  TOperation,
  TOperations,
  TActions,
  TExpression
} from 'types'

import { buildActionReducer } from './actionReducerBuilder'

import { reduce } from './reduce'

function setPrefix<T> (dictionary: IDictionary<T>, prefix: string) {
  const prefixSetter = (acc: IDictionary<T>, key: string) => ({ ...acc, [prefix + key]: dictionary[key] })
  return Object.keys(dictionary).reduce(prefixSetter, {})
}

function toOperation (action: any) : TOperation {
  if (!action || typeof action !== 'function') {
    throw new Error(`Invalid action argument: ${action}`)
  }
  return action
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
