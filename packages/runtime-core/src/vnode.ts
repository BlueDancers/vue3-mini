import { isArray, isFunction, isObject, isString } from 'packages/shared/src'
import { normalizeClass, normalizeStyle } from 'packages/shared/src/normalizeProp'
import { ShapeFlags } from 'packages/shared/src/shapeFlags'

export const Fragment = Symbol('Fragment') // 片段
export const Text = Symbol('Text') // 文字
export const Comment = Symbol('Comment') // 注释

export type VNode = {
  __v_isVNode: boolean
  type: any
  props: any
  children: any
  shapeFlag: number
  key: any
}

/**
 * 判断是否vnode
 * @param value
 * @returns
 */
export function isVNode(value) {
  return value ? value.__v_isVNode === true : false
}

export function createVNode(type, props, children?): VNode {
  /**
   * 解析class与style
   */
  if (props) {
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
    if (isObject(style)) {
      props.style = normalizeStyle(style)
    }
  }

  /**
   * 处理shapeFlags
   */
  let shapeFlag
  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  } else if (isObject(type)) {
    shapeFlag = ShapeFlags.STATEFUL_COMPONENT
  } else if (isFunction(type)) {
    shapeFlag = ShapeFlags.FUNCTIONAL_COMPONENT
  } else {
    shapeFlag = 0
  }
  return createBaseVNode(type, props, children, shapeFlag, true)
}

function createBaseVNode(type, props, children, shapeFlag, needFullChildrenNormalization) {
  let vnode: VNode = {
    __v_isVNode: true,
    children,
    props,
    shapeFlag,
    type,
    key: null,
  }
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children)
  }
  return vnode
}

function normalizeChildren(vnode: VNode, children) {
  let type
  let { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (isObject(children)) {
    children = children.render()
    type = ShapeFlags.FUNCTIONAL_COMPONENT
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.children = children
  // 位运算
  vnode.shapeFlag |= type
  // 等同于以下写法
  // vnode.shapeFlag = vnode.shapeFlag | type
}

/**
 * 判断2个VNode是否为一个元素
 * @param n1 
 * @param n2 
 * @returns 
 */
export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}
