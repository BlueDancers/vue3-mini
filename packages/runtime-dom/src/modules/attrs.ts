/**
 * 使用HTML属性进行设置
 * @param el 
 * @param key 
 * @param value 
 */
export function patchAttr(el: Element, key, value) {
  if (value) {
    el.setAttribute(key, value)
  } else {
    el.removeAttribute(key)
  }
}
