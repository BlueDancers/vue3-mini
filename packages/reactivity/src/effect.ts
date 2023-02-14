import { isArray } from '@vue/shared'
import { ComputedRefImpl } from './computed'
import { createDep, Dep } from './dep'

export type EffectScheduler = (...args: any[]) => any
type KeyDepType = Map<any, Dep>

const targetMap = new WeakMap<any, KeyDepType>()

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  // 完成第一次执行
  _effect.run()
  // 依赖收集完毕 清除当前effect
  // activeEffect = undefined
  // 如果不清除 最后一次被初始化的effect将会一直留在内存中
  // 在若干时间后,触发get行为,都是触发track,将一直留在内存中的effec与当前get的变量产生联系,造成错误的依赖收集
}

/**
 * 当前被执行的effect
 */
export let activeEffect: ReactiveEffect | undefined

// <T = any> 给泛型一个默认值 否则作为类型的时候,一定要指定泛型类型
export class ReactiveEffect<T = any> {
  public computed?: ComputedRefImpl<T>

  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) {}

  run() {
    try {
      activeEffect = this
      return this.fn()
    } finally {
      // 简化
      activeEffect = undefined

      // 源码中会保存上一个effect(effect嵌套场景),主要解决effect的嵌套调用问题
      // constructor parent: ReactiveEffect | undefined = undefined
      // catch  activeEffect = this.parent
      // finally this.parent = activeEffect
      // finally this.parent = undefined
    }
  }
}

interface Dictionary<T> {
  [key: string]: T
}
type StrDict = Dictionary<string>

/**
 * 依赖收集
 */
export function track(target: object, key: string) {
  console.log('依赖收集')
  // 当前没带缓存的effect,无依赖需要收集,直接退出
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  // 获取对象内变量是否存在Set 如果不存在 进行初始化
  let dep = depsMap.get(key)
  if (!dep) {
    dep = createDep()
    depsMap.set(key, dep)
  }
  // 将effect与被读取变量建立联系
  trackEffects(dep)
  // dep.add(activeEffect!)

  // depsMap.set(key, activeEffect)
  // console.log('targetMap', targetMap)
}

/**
 * 将当前effect添加到dep(set)中
 * @param dep
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * 依赖触发
 */
export function trigger(target: object, key: string, newValue: unknown) {
  let depsMap = targetMap.get(target)
  // 如果拿不到Map,这说明当前对象没有effect要触发
  if (!depsMap) {
    return
  }
  const dep: Dep | undefined = depsMap.get(key)

  // 虽然当前对象中存在effect, 但是本次读取的 对象内变量 不存在,所以此处获取不到值
  if (!dep) {
    return
  }
  triggerEffects(dep)
}

/**
 * 处理所有待触发依赖
 */
export function triggerEffects(dep: Dep) {
  // const effects = isArray(dep) ? dep : [...dep]
  const effects = [...dep]
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

/**
 * 触发执行依赖
 */
function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.fn()
  }
}
