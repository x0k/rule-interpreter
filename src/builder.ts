import { Operation } from './operation';

export type TGetter = (array: any[], index: number) => any;

type Parameters = Array<any | IParameters>;
interface IParameters extends Array<any | Parameters> { }

export const buildAction = (data: any[], getter: TGetter): any => {
  const parameters: IParameters = [];
  for (let i = data.length - 1; i >= 0; i--) {
    const element = getter(data, i);
    if (Array.isArray(element)) {
      parameters.unshift(buildAction(element, getter));
    } else if (element instanceof Operation) {
      if (Array.isArray(parameters[0])) {
        parameters.unshift(element.eval(...parameters.shift()));
      } else {
        parameters.unshift(element.eval(...parameters.splice(0, element.arity)));
      }
    } else {
      parameters.unshift(() => element);
    }
  }
  return parameters.length === 1 ? parameters[0] : parameters;
};
