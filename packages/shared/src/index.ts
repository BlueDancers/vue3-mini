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

/**
 * 是否是一个防范
 * @returns
 */
export function isFunction(val: unknown): boolean {
  return typeof val === 'function'
}

/**
 * 只读空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}
