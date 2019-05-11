import test from 'ava'

import { buildActionsBuilder } from '../build'

const evaluate = (handler, value) => typeof handler === 'function' ? handler(value) : handler

const operations = {
  condition (value) {
    return value > 10
  },
  or (predicate, next, value) {
    if (value !== undefined) {
      return evaluate(predicate, value) || evaluate(next, value)
    }
    return evaluate(predicate, next)
  },
  and (predicate, next, value) {
    if (value !== undefined) {
      return evaluate(predicate, value) && evaluate(next, value)
    }
    return evaluate(predicate, next)
  }
}

const actionsBuilder = buildActionsBuilder(operations)

function buildAction (expression) {
  return actionsBuilder(expression)[0]
}

test('Simple logical expression', t => {
  const expression = [ '@or', [ false, '@and', [ '@condition', [], true ] ] ]
  const action = buildAction(expression)
  t.is(action(11), true)
})
