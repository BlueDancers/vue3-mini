import { EMPTY_OBJ, hasChange, isFunction, isObject } from '@vue-mini/shared'
import { isReactive, isRef, ReactiveEffect } from '@vue-mini/reactivity'
import { queuePreFlushCb } from './scheduler'

export interface WatchOptions<immediate = boolean> {
  immediate?: immediate
  deep?: boolean
}

export function watch(source: any, cb: Function, options: WatchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(source, cb: Function, { deep, immediate }: WatchOptions = EMPTY_OBJ) {
  let getter: () => any

  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else if (isRef(source)) {
    getter = () => source.value
  } else if (isFunction(source)) {
    // 后面再写
    getter = () => {}
  } else {
    getter = () => {}
  }

  if (cb && deep) {
    // 浅拷贝 baseGetter与getter指向同一个内存空间
    const baseGetter = getter
    getter = () => traverse(baseGetter())
    // getter = () => traverse(getter()) // 会触发内存泄露
  }

  let oldValue = {}
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
