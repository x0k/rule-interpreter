export function reduce<T> (array: T[], reducer: (acc: T[], element: T) => T[]) {
  return array.reverse().reduce(reducer, [])
}
