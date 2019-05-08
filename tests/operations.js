import test from 'ava'

import buildActions from '../build'

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

const context = {
  'a': 10,
  'b': 20
}

function buildAction (expression) {
  return buildActions(expression, operations)[0]
}

test('Simple arithmetic', t => {
  const data = [ '@-', 2, 1 ]
  const action = buildAction(data)
  t.is(action(context), 1)
})

test('Complex arithmetic', t => {
  //              0        10   6    3    6              2
  const data = [ '@-', 10, '@+', '@*', '@/', '@-', 12, 6, 2, '@-', 4, 2, 4 ]
  const action = buildAction(data)
  t.is(action(context), 0)
})

test('Arithmetic with variables', t => {
  const data = [ '@/', '%b', '%a' ]
  const action = buildAction(data)
  t.is(action(context), 2)
})

test('Logical operations', t => {
  t.plan(2)
  const data1 = [ '@&', true, 'string literal', 123, {}, '@!', false ]
  const action1 = buildAction(data1)
  t.is(action1(), true)
  const data2 = [ '@|', '@!', true, '@!', 'string literal', '@!', 123, '@!', [{}] ]
  const action2 = buildAction(data2)
  t.is(action2(), false)
})
