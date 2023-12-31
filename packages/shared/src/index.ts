export const isArray = Array.isArray

export const isObject = (val: unknown) =>
  val !== null && typeof val === 'object'

export const hasChange = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const extend = Object.assign

export const EMPTY_OBJ: { readonly [key: string]: any } = {}

export const isString = (val: unknown): val is string =>
  typeof val === 'string'

const onRE = /^on[^a-z]/
export const isOn = (key: string) =>
  onRE.test(key)

export const NO = () => false

export { ShapeFlags } from './shapeFlags'
export { normalizeClass } from './normalizeProp'
export { toDisplayString } from './toDisplayString'