import test from 'ava'

import { buildActionsBuilder } from '../build'

const operations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '=': (a, b) => a === b,
  '%': (a, b) => a % b,
  '!': (operand) => !operand
}

const actionsBuilder = buildActionsBuilder(operations)

function buildAction (expression) {
  return actionsBuilder(expression)[0]
}

test('Simple arithmetic', t => {
  const expression = [ '@-', [ 2, 1 ] ]
  const action = buildAction(expression)
  t.is(action(), 1)
})

test('Arithmetic with variable', t => {
  const expression = [ '@/', [ 20 ] ]
  const action = buildAction(expression)
  t.is(action(4), 5)
})
