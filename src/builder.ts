import { Handler } from './operations';
import { Getter } from './getter';

const isArr = (value: any) => Array.isArray(value);

const perform = (flow: any[], getter: Getter): Handler => {
  const parameters: any[] = [];
  for (let i = flow.length - 1; i >= 0; i--) {
    const element = getter(flow, i);
    if (isArr(element)) {
      parameters.unshift(perform(element, getter));
    } else if (typeof(element) === 'function') {
      if (isArr(parameters[0])) {
        parameters.unshift(element(...parameters.shift()));
      } else {
        const len = element.length;
        parameters.unshift(len ? element(...parameters.splice(0, len)) : element());
      }
    } else {
      parameters.unshift(() => element);
    }
  }
  return parameters.length === 1 ? parameters[0] : parameters;
};

export const buildHandler = (handlerFlow: any[], getter: Getter): Handler => {
  const expression = perform(handlerFlow, getter);
  return (input, output) => expression(input, output);
};
