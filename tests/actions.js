import test from 'ava'

import { buildActionsBuilder } from '../build'

const operations = {
  inc (step, value) {
    return value + step
  },
  sum (...numbers) {
    return numbers.reduce((sum, value) => sum + value, 0)
  }
}

const actionsBuilder = buildActionsBuilder(operations)

function buildAction (expression) {
  return actionsBuilder(expression)[0]
}

test('Map action', t => {
  const expression = [ '$map', [1, 2, 3], '@inc', [3] ]
  const action = buildAction(expression)
  t.deepEqual(action, [4, 5, 6])
})

test('Eval action', t => {
  const expression = [ '$eval', '@sum', [1, 2, 3] ]
  const action = buildAction(expression)
  t.is(action, 6)
})
