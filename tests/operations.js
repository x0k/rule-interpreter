import test from 'ava';

import { buildAction, Operation } from '../build/index';

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

  eval (...values) {
    return () => super.eval(...values);
  }

  evaluator (action, ...values) {
    return super.evaluator(action, ...values.map(val => val()))
  }

}

const getter = (arr, id) => {
  const el = arr[id];
  if (el in actions) {
    return new SimpleOperation(el, actions[el]);
  }
  return el;
};

test('Simple arithmetic', t => {
  const data = [ '+', [ 1, 1 ] ];
  const action = buildAction(data, getter);
  t.is(action(), 2);
});

test('Complex arithmetic', t => {
  //              6      5      4        3                2        1
  const data = [ '-', [ '+', [ '*', [ [ '-', [ 4, 2 ] ], '/', [ [ '-', [ 12, 6 ] ], 2 ] ], 4 ], 10 ] ];
  const action = buildAction(data, getter);
  t.is(action(), 0);
});

test('Logical operations', t => {
  t.plan(2);
  const data1 = [ '&', [ true, 'string literal', 123, {}, '!', [ false ] ] ];
  const action1 = buildAction(data1, getter);
  t.is(action1(), true);
  const data2 = [ '|', [ '!', [true], '!', ['string literal'], '!', [123], '!', [{}] ] ];
  const action2 = buildAction(data2, getter);
  t.is(action2(), false);
});
