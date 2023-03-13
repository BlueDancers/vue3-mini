import { isObject } from '@vue-mini/shared'
import { track, trigger } from './effect'
import { reactive } from './reactive'

function createGetter() {
  return function get(target: object, key: string, receiver: object) {
    // 常规读取
    const res = Reflect.get(target, key, receiver)
    // 核心逻辑: 依赖收集
    track(target, key)

    if (isObject(res)) {
      // 嵌套场景中父级对象属于读取操作,如果子类没有代理,将会监听不到子类对象的变化,进而无法触发effect
      return reactive(res)
    }

    return res
  }
}

function createSetter() {
  return function set(target: object, key: string, newValue: unknown, receiver: object) {
    // 常规赋值
    const res = Reflect.set(target, key, newValue, receiver)
    // 核心逻辑: 依赖触发
    trigger(target, key, newValue)
    return res
  }
}

const get = createGetter()
const set = createSetter()

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
}
