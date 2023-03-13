import { Dep } from './dep'
import { toReactive } from './reactive'
import { createDep } from './dep'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import { hasChange } from '@vue-mini/shared'

export type Ref<T = any> = {
  value: T
}

/**
 * 入口函数
 */
export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  // 判断是否已经是ref,如果是直接返回其本身
  if (isRef(rawValue)) {
    return rawValue
  }
  // ref本质上就是RefImpl的实例
  return new RefImpl(rawValue, shallow)
}

class RefImpl<T = any> {
  /**
   * ref每次读取与返回的属性
   */
  private _value: T
  /**
   * ref中value的原始属性
   */
  private _rawValue: T
  /**
   * 当前ref相关effect
   */
  public dep: Dep | undefined
  /**
   * 标记__v_isRef为true,以后将无法在通过isRef()的判断
   */
  public readonly __v_isRef: boolean = true
  constructor(value: T, public readonly __v_isShallow: boolean) {
    // 赋值原始值
    this._rawValue = value
    // ref API中__v_isShallow,一定为false
    // 如果value是基础类型,则toReactive返回原值
    // 如果value是复杂类型,则toReactive会将其处理成为reactive(proxy)再返回,这就意味着,此时的value是一个proxy
    this._value = __v_isShallow ? value : toReactive(value)
  }
  // 访问ref.value的时候触发
  get value() {
    // 配合effect阶段保存的activeEffect,将依赖收集到this.dep中
    trackRefValue(this)
    // 返回最新value
    return this._value
  }
  set value(newVal) {
    // 判断当前set的value是否存在变化, 有变化则进入if
    if (hasChange(newVal, this._rawValue)) {
      // 赋值最新原始值
      this._rawValue = newVal
      // 如果value是基础类型, 则toReactive返回原始值
      // 如果value是引用类型, 则通过toReactive将新的value其处理为proxy
      // 新的引用类型的value由于重新赋值, 与原本的effect在WeakMap中断了联系
      // 但是马上触发的ref本身的dep依赖中,将会再次将新的value与effect通过WeakMao完成依赖收集
      this._value = toReactive(newVal)
      // 触发get阶段收集在this.dep中的依赖
      triggerRefValue(this)
    }
  }
}

/**
 * ref 依赖收集
 */
export function trackRefValue(ref) {
  // 判断当前是否存在需要收集的依赖
  if (activeEffect) {
    // 判断RefImpl的实例中的dep是否被初始化过
    if (!ref.dep) {
      // 如果没有, 则赋值为Set
      ref.dep = createDep()
    }
    // 将当前effect收集到当前RefImpl实例的dep中, 完成依赖收集
    trackEffects(ref.dep)
  }
}

/**
 * ref 依赖触发
 */
export function triggerRefValue(ref) {
  // 当前当前RefImpl实例中是否存在收集的依赖
  if (ref.dep) {
    // 触发依赖
    triggerEffects(ref.dep)
  }
}

/**
 * 判断是否是ref
 */
export function isRef(r: any): boolean {
  return !!(r && r.__v_isRef === true)
}
