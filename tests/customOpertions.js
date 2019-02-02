import test from 'ava';

import { Operation, buildAction } from '../build/index';

class CustomOperation extends Operation {

  eval (...values) {
    return (input, output) => super.eval(input, output, ...values);
  }

  evaluator (action, input, output, ...values) {
    return super.evaluator(action(input, output), ...values.map(val => val(input, output)));
  }

}

const actions = {
  declare: (input, output) => (name, value) => {
    input[name] = value;
    return value;
  },
  del: (input, output) => (name) => delete input[name],
  get: (input, output) => (name) => input[name],
  push: (input, output) => (data) => output.push(data),
};

test('Variables', t => {
  t.plan(2);
  const data = {};
  const out = [];
  const getter = (arr, id) => {
    const el = arr[id];
    if (el in actions) {
      return new CustomOperation(el, actions[el]);
    } else if (el in data) {
      return data[el];
    }
    return el;
  };
  const setFlow = [ 'declare', 'var1', 10 ];
  const set = buildAction(setFlow, getter);
  const pushFlow = [ 'push', 'get', 'var1' ];
  const push = buildAction(pushFlow, getter);
  set(data, out);
  t.deepEqual(data, { var1: 10 });
  push(data, out);
  t.deepEqual(out, [ 10 ]);
});