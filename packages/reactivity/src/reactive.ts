import { isObject } from '@vue/shared'
import { mutableHandlers } from './baseHandlers'

// 缓存proxy
const reactiveMap = new WeakMap<object, any>()

// 入口函数
export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

// 处理被代理对象
function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<object>,
  proxyMap: WeakMap<object, any>
) {
  // 如果已经被代理过,这直接返回结果
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

/**
 * 将对象转化为reative
 * 如果不是对象,则园路返回
 */
export function toReactive<T extends unknown>(value: T): T {
  return isObject(value) ? reactive(value) : value
}
