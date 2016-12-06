// @flow

const npl = module.exports = <T>(items: Array<T>, index: number, mod: (arg: T) => T): Array<T> => {
  const np = items.slice()
  np[index] = mod(np[index])
  return np
}
