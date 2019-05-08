import test from 'ava'

import { buildActionsBuilder } from '../build'

const operations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
  '*': (a, b) => a * b,
  '=': (a, b) => a === b,
  '%': (a, b) => a % b,
  '!': (operand) => !operand,
  '&': (...list) => {
    const len = list.length
    let i = 0
    let result = true
    while (i < len && result) {
      result = list[i++]
    }
    return i === len ? result : false
  },
  '|': (...list) => {
    for (const item of list) {
      const val = item
      if (val) {
        return val
      }
    }
    return false
  }
}

const actionsBuilder = buildActionsBuilder(operations)

function buildAction (expression) {
  return actionsBuilder(expression)[0]
}

test('Simple arithmetic', t => {
  const data = [ '$eval', [ 2, 1 ], '@-' ]
  const action = buildAction(data)
  t.is(action, 1)
})

test('Arithmetic with variable', t => {
  const data = [ '$bind', [ 4 ], '@/' ]
  const action = buildAction(data)
  t.is(action(2), 2)
})

// test('Logical operations', t => {
//   t.plan(2)
//   const data1 = [ '@&', true, 'string literal', 123, {}, '@!', false ]
//   const action1 = buildAction(data1)
//   t.is(action1(), true)
//   const data2 = [ '@|', '@!', true, '@!', 'string literal', '@!', 123, '@!', [{}] ]
//   const action2 = buildAction(data2)
//   t.is(action2(), false)
// })
