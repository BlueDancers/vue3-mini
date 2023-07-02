import { isString } from '@vue-mini/shared'

export function patchStyle(el: Element, prev, next) {
  const style = (el as HTMLElement).style
  const isCssString = isString(next)
  if (next && !isCssString) {
    for (const key in next) {
      // 设置最新的
      setStyle(style, key, next[key])
    }
    if (prev && !isString(prev)) {
      // 删除之前的
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, '')
        }
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        style.cssText = next
      }
    }
  }
}

/**
 * 为元素更新style
 * @param style
 * @param name
 * @param val
 */
function setStyle(style: CSSStyleDeclaration, name, val) {
  style[name] = val
}
