export const isArray = (arr: any) => Array.isArray(arr)

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

/**
 * 判断值是否不相同
 */
export function hasChange(value: any, oldValue: any): boolean {
  return !Object.is(value, oldValue)
}

export function isFunction(val: unknown): boolean {
  return typeof val === 'function'
}

export function isString(val): boolean {
  return typeof val === 'string'
}

/**
 * 只读空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}

const onRE = /^on[^a-z]/
/**
 * 判断是否on开头
 * @param key
 * @returns
 */
export const isOn = (key: string) => onRE.test(key)

/**
 * 对象合并
 */
export const extend = Object.assign
