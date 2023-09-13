import { reactive } from 'packages/reactivity/src'
import { isObject } from 'packages/shared/src'
import { onBeforeMount, onMounted } from './apiLifecycle'

let uid = 0

export const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
}

/**
 * 创建component的基本属性
 * @param vnode
 * @returns
 */
export function createComponentInstance(vnode) {
  // 这里的vnode.type就是h函数第一个参数，就是render函数本身
  const instance = {
    uid: uid++,
    vnode: vnode,
    type: vnode.type,
    subTree: null,
    effect: null,
    update: null,
    render: null,
    isMounted: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
  }
  return instance
}

export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // 获取到render函数，并保存到instance中
  const Component = instance.type
  instance.render = Component.render

  applyOptions(instance)
}

function applyOptions(instance) {
  const { data: dataOptions, beforeCreate, created, beforeMount, mounted } = instance.type

  if (beforeCreate) {
    callHook(beforeCreate)
  }

  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }

  if (created) {
    callHook(created)
  }

  function registerLifecycleHook(register: Function, hook?: Function) {
    register(hook, instance)
  }

  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
}

function callHook(fn) {
  fn && fn()
}
