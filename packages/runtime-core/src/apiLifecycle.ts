import { LifecycleHooks } from './component'

function injectHook(type: LifecycleHooks, hook: Function, target) {
  if (target) {
    // 将生命周期函数存放到组件中
    target[type] = hook
    return hook
  }
}

function createHook(lifecycle: LifecycleHooks) {
  // lifecycle是当前生命周期函数的标识
  // hook是当前生命周期函数
  // target是当前组件实例
  return (hook, target) => injectHook(lifecycle, hook, target)
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
