import { Operation } from './operation';

type TGetter = (element: any, array: any[]) => any;

type Parameters = Array<any | IParameters>;
interface IParameters extends Array<any | Parameters> { }

export const buildActions = (data: any[], getter: TGetter): any[] => {
  const parameters: IParameters = [];
  for (const item of data) {
    if (Array.isArray(item)) {
      parameters.push(item);
    } else {
      const element = getter(item, data);
      if (element instanceof Operation) {
        if (Array.isArray(parameters[parameters.length - 1])) {
          parameters.push(element.eval(...buildActions(parameters.pop(), getter)));
        } else {
          parameters.push(element.eval(...parameters.splice(parameters.length - element.arity, element.arity)));
        }
      } else {
        parameters.push(element);
      }
    }
  }
  return parameters;
};
