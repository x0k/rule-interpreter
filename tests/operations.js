import test from 'ava';

import { buildActions, Operation } from '../build';

const actions = {
  '+': (a, ...b) => b.reduce((acc, val) => acc + val, a),
  '-': (a, ...b) => b.reduce((acc, val) => acc - val, a),
  '/': (a, ...b) => b.reduce((acc, val) => acc / val, a),
  '*': (a, ...b) => b.reduce((acc, val) => acc * val, a),
  '=': (a, ...b) => b.reduce((acc, val) => acc === val ? acc : false, a),
  '%': (a, ...b) => b.reduce((acc, val) => acc % val, a),
  '!': (operand) => !operand,
  '&': (...list) => {
    const len = list.length;
    let i = 0;
    let result = true;
    while (i < len && result) {
      result = list[i++];
    }
    return i === len ? result : false;
  },
  '|': (...list) => {
    for (const item of list) {
      const val = item;
      if (val) {
        return val;
      }
    }
    return false;
  },
};

class SimpleOperation extends Operation {

  evaluator (action, ...values) {
    return () => super.evaluator(action, ...values.map(val => val()))
  }

}

const getter = (el) => {
  if (el in actions)
    return new SimpleOperation(el, actions[el]);
  return () => el;
};

test('Simple arithmetic', t => {
  const data = [ [ 2, 1 ], '-' ];
  const [ action ] = buildActions(data, getter);
  t.is(action(), 1);
});

test('Complex arithmetic', t => {
  // 10 - ((12 - 6) / 2 * (4 - 2) + 4)
  const data = [ [10, [[[[12, 6], '-', 2], '/', [4, 2], '-'], '*', 4], '+'], '-' ];
  const [ action ] = buildActions(data, getter);
  t.is(action(), 0);
});

test('Logical operations', t => {
  t.plan(2);
  const data1 = [ [ true, 'string literal', 123, {}, false, '!' ], '&' ];
  const [ action1 ] = buildActions(data1, getter);
  t.is(action1(), true);
  const data2 = [ [ true, '!', 'string literal', '!', 123, '!', [{}], '!' ], '|' ];
  const [ action2 ] = buildActions(data2, getter);
  t.is(action2(), false);
});
