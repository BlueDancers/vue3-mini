import { isOn } from '@vue-mini/shared'
import { patchClass } from './modules/class'

export const patchProp = (el: Element, key: string, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
  } else if (isOn(key)) {
  } else {
  }
}
