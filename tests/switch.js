import test from 'ava'

import { buildActionsBuilder } from '../build'

function timePeriodToMilliseconds ([hours, minutes]) {
  return Date.UTC(0, 0, 1, hours, minutes)
}

function inTimePeriod (start, end, time) {
  const startTime = timePeriodToMilliseconds(start)
  const endTime = timePeriodToMilliseconds(end)
  return startTime <= time && time <= endTime
}

const evaluate = (handler, value) => typeof handler === 'function' ? handler(value) : handler

const operations = {
  case (predicate, handler, next, value) {
    return predicate(value) ? evaluate(handler, value) : next(value)
  },
  default (handler, value) {
    return evaluate(handler, value)
  },
  inTimePeriod
}

const actionsBuilder = buildActionsBuilder(operations)

function handleResult (index) {
  return index >= 0 && (index + 1)
}

function currentCall (time) {
  return handleResult([
    [[8, 0], [9, 30]],
    [[9, 40], [11, 10]],
    [[11, 20], [12, 50]],
    [[13, 50], [15, 20]],
    [[15, 30], [17, 0]],
    [[17, 10], [18, 40]],
    [[18, 50], [20, 20]],
    [[20, 30], [22, 0]]
  ].findIndex(([start, end]) => inTimePeriod(start, end, time)))
}

const expression = [
  '@case', ['@inTimePeriod', [[8, 0], [9, 30]], 1,
    '@case', ['@inTimePeriod', [[9, 40], [11, 10]], 2,
      '@case', ['@inTimePeriod', [[11, 20], [12, 50]], 3,
        '@case', ['@inTimePeriod', [[13, 50], [15, 20]], 4,
          '@case', ['@inTimePeriod', [[15, 30], [17, 0]], 5,
            '@case', ['@inTimePeriod', [[17, 10], [18, 40]], 6,
              '@case', ['@inTimePeriod', [[18, 50], [20, 20]], 7,
                '@case', ['@inTimePeriod', [[20, 30], [22, 0]], 8,
                  '@default', [false]]]]]]]]]
]

test('Current call', t => {
  const date = new Date()
  const time = timePeriodToMilliseconds([date.getHours(), date.getMinutes()])
  const action = actionsBuilder(expression)[0]
  t.is(action(time), currentCall(time))
})
