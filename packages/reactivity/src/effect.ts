import { ComputedRefImpl } from './computed'
import { createDep, Dep } from './dep'

export type EffectScheduler = (...args: any[]) => any
type KeyDepType = Map<any, Dep>
const targetMap = new WeakMap<any, KeyDepType>()

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  // 完成第一次执行
  _effect.run()
}

/**
 * 当前被执行的effect
 */
export let activeEffect: ReactiveEffect | undefined
const effectStack: any[] = []

// <T = any> 给泛型一个默认值 否则作为类型的时候,一定要指定泛型类型
export class ReactiveEffect<T = any> {
  public computed?: ComputedRefImpl<T>
  constructor(public fn: () => T, public scheduler: EffectScheduler | null = null) {}
  deps: Dep[] = []

  run() {
    try {
      cleanup(this)
      activeEffect = this
      effectStack.push(activeEffect)
      let res = this.fn()
      effectStack.pop() // 移除当前effect
      activeEffect = effectStack[effectStack.length - 1] // 获取上一个effect
      return res
    } catch (error) {
      console.log(error)
    }
  }
  stop() {
  }
}

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
  let deps = depsMap.get(key)
  if (!deps) {
    deps = createDep()
    depsMap.set(key, deps)
  }
  // 将effect与被读取变量建立联系
  trackEffects(deps)
  // dep.add(activeEffect!)

  // depsMap.set(key, activeEffect)

  // 单触发effect的时候，一个effect里面存在多个get的场景，所以这里可以收集到多个effect
  activeEffect.deps.push(deps)
  console.log('targetMap', targetMap)
}

/**
 *
 * @param dep
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * 依赖触发
 */
export function trigger(target: object, key: string, newValue: unknown) {
  console.log('依赖触发', targetMap)
  let depsMap = targetMap.get(target)
  // 如果拿不到Map,这说明当前对象没有effect要触发
  if (!depsMap) {
    return
  }
  const effects: Dep | undefined = depsMap.get(key)

  // 虽然当前对象中存在effect, 但是本次读取的 对象内变量 不存在,所以此处获取不到值
  if (!effects) {
    return
  }
  triggerEffects(effects)
}

/**
 * 处理所有待触发依赖
 */
export function triggerEffects(dep: Dep) {
  // const effects = isArray(dep) ? dep : [...dep]
  const effects = [...dep]
  for (const effect of effects) {
    if (effect !== activeEffect) {
      triggerEffect(effect)
    }
  }
}

/**
 * 触发执行依赖
 */
function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}

/**
 * 清除依赖
 * @param effect
 */
function cleanup(effect: ReactiveEffect) {
  // 再触发get时候，会将所有触发的依赖的effect都添加到effect.deps中
  // 将上一次依赖收集到的ReactiveEffect全部都清除，在一次触发get时候，重新收集依赖
  for (let i = 0; i < effect.deps.length; i++) {
    const dep = effect.deps[i]
    dep.delete(effect)
  }
  effect.deps.length = 0
}
