import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Text, createVNode } from './vnode'

/**
 * 判断如何渲染子组件
 * @param child 子组件
 * @returns
 */
export function normalizeVNode(child) {
  if (typeof child == 'object') {
    // 已经是vnode
    return cloneIfMounted(child)
  } else {
    // 创建Text类型的vnode
    return createVNode(Text, null, String(child))
  }
}

export function cloneIfMounted(child) {
  return child
}

/**
 * 生成可渲染vnode的函数（执行render函数返回的h函数，并修改this指向到data）
 * @param instance
 * @returns
 */
export function rednerComponentRoot(instance) {
  const { vnode, render, data } = instance
  let result: any = {}

  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      result = normalizeVNode(render.call(data))
    }
  } catch (error) {
    console.error('error', error)
  }

  return result
}
