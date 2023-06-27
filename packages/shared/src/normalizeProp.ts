import { isArray, isObject, isString } from '.'

/**
 * vnode增加class的实现
 */
export function normalizeClass(value): string {
  let res = ''

  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i])
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (isObject(value)) {
    for (const key in value) {
      if (value[key]) {
        res += key + ' '
      }
    }
  }

  return res.trim()
}

export type NormalizedStyle = Record<string, string | number> // 键值对组成的对象类型

/**
 * vnode增强style的实现
 * @param value 
 * @returns 
 */
export function normalizeStyle(value): any {
  if (isArray(value)) {
    let res: NormalizedStyle = {}
    for (let i = 0; i < value.length; i++) {
      const item = value[i]
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item)
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key]
        }
      }
    }
    return res
  } else if (isString(value)) {
    return value
  } else if (isObject(value)) {
    return value
  }
}

export const listDelimiterRE = /;(?![^(]*\))/g // 'a;b(c;d);e;f'; => ["a", "b(c;d)", "e", "f"]  匹配所有不在括号内的分号字符
export const propertyDelimiterRE = /:(.+)/ // "color:#fff" => ["color", "#fff"] 匹配冒号和其后的所有字符

/**
 * 将srting类型的style解析为object的style
 * @param cssText
 * @returns
 */
export function parseStringStyle(cssText: string): NormalizedStyle {
  let res: NormalizedStyle = {}
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE)
      if (tmp.length > 1) {
        let [key, value] = tmp
        res[key.trim()] = value.trim()
      }
    }
  })
  return res
}
