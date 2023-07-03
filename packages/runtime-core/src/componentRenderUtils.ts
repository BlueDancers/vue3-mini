import { Text, createVNode } from './vnode'

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
