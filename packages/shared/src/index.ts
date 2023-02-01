export const isArray = (arr: []) => Array.isArray(arr)

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'
