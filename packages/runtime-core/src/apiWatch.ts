import { hasChange, EMPTY_OBJ, isArray, isFunction, isObject } from '@vue-mini/shared'
import { isReactive, isRef, ReactiveEffect } from '@vue-mini/reactivity'
import { queuePreFlushCb } from './scheduler'

export interface WatchOptions<immediate = boolean> {
  immediate?: immediate
  deep?: boolean
}

// 观察者在未定义的初始值上触发的初始值
const INITIAL_WATCHER_VALUE = {}

export function watch(source: any, cb: Function, options: WatchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(source, cb: Function, { deep, immediate }: WatchOptions = EMPTY_OBJ) {
  let getter: () => any
  let isMultiSource = false // 是否是多源监听

  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isArray(source)) {
    isMultiSource = true
    // 如果是对象则,循环处理每一项
    // ref则返回其value
    // reactive则通过traverse,递归访问所有key
    getter = () =>
      source.map((s) => {
        if (isRef(s)) {
          return s.value
        } else if (isReactive(s)) {
          return traverse(s)
        }
      })
  } else {
    getter = () => {}
  }

  if (cb && deep) {
    // 浅拷贝 baseGetter与getter指向同一个内存空间
    const baseGetter = getter
    getter = () => traverse(baseGetter())
    // getter = () => traverse(getter()) // 会触发内存泄露
  }

  let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE
  // 触发job就是触发watch
  const job = () => {
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChange(newValue, oldValue)) {
        // 执行
        cb(newValue, oldValue)
      }
    }
  }

  let scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}

/**
 * 递归触发监听项的get
 * 循环当前source里面所有的属性 以此完成所有的依赖收集
 */
export function traverse(value: unknown) {
  if (!isObject(value)) {
    return value
  }
  // 递归
  for (const key in value as object) {
    traverse((value as object)[key])
  }
  return value
}
