import test from 'ava';

import { Operation, buildActions } from '../build/index';

class CustomOperation extends Operation {

  evaluator (action, ...values) {
    return (input, output) => super.evaluator(action(input, output), ...values.map(val => val(input, output)));
  }

}

const actions = {
  declare: (input, output) => (name, value) => {
    input[name] = value;
    return value;
  },
  del: (input, output) => (name) => delete input[name],
  push: (input, output) => (data) => output.push(data),
};

test('Variables', t => {
  t.plan(2);
  const data = {};
  const out = [];
  const getter = (el) => {
    if (el in actions)
      return new CustomOperation(el, actions[el]);
    return (input, output) => el in input ? input[el] : el;
  };
  const flow = [ ['var1', 10], 'declare', ['var1'], 'push'];
  const [ set, push ] = buildActions(flow, getter);
  set(data, out);
  t.deepEqual(data, { var1: 10 });
  push(data, out);
  t.deepEqual(out, [ 10 ]);
});