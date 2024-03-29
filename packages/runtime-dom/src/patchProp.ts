import { isOn } from '@vue-mini/shared'
import { patchClass } from './modules/class'
import { patchDOMProp } from './modules/props'
import { patchAttr } from './modules/attrs'
import { patchStyle } from './modules/style'
import { patchEvent } from './modules/events'

export const patchProp = (el: Element, key: string, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    patchEvent(el, key, prevValue, nextValue)
  } else if (shouldSetAsProp(el, key)) {
    // 如果可以通过dom原生属性进行设置,则进入这里
    patchDOMProp(el, key, nextValue)
  } else {
    // 如果无法使用dom属性进行设置,则进入这里
    patchAttr(el, key, nextValue)
  }
}

/**
 * 判断是否使用Dom原生API进行实现
 * @param el
 * @param key
 * @returns
 */
function shouldSetAsProp(el: Element, key: string) {
  console.log(el.tagName, ' el.tagName')
  if (key == 'form') {
    // 表单属性只读
    return false
  }
  if (key == 'list' && el.tagName == 'INPUT') {
    // input的list必须使用attr进行设置
    return false
  }
  if (key == 'type' && el.tagName == 'TEXTAREA') {
    // textarea的type必须使用attr进行设置
    return false
  }
  return key in el
}
