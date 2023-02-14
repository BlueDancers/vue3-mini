export const isArray = (arr: []) => Array.isArray(arr)

export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

/**
 * 判断值是否不相同
 */
export function hasChange(value: any, oldValue: any): boolean {
  return !Object.is(value, oldValue)
}

export function isFunction(val: unknown): boolean {
  return typeof val === 'function'
}
