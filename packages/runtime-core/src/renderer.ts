import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, Text } from './vnode'
import { EMPTY_OBJ } from 'packages/shared/src'

type RendererOptions = {
  /**
   * 指定元素props打补丁
   * @param el
   * @param key
   * @param preValue
   * @param nextValue
   */
  patchProp(el: Element, key: string, preValue: any, nextValue: any): void
  /**
   * 指定元素设置文本
   * @param node
   * @param text
   */
  setElementText(node: Element, text: string): void
  /**
   * 插入指定el到parent的指定位置
   * @param el 元素
   * @param parent 父节点
   * @param anchor 指定位置
   */
  insert(el, parent: Element, anchor?): void
  /**
   * 创建元素
   * @param type
   */
  createElement(type: string)
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

export function baseCreateRenderer(options: RendererOptions) {
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    patchProp: hostPatchProp,
    setElementText: hostSetElementText,
  } = options

  function processElement(oldVNode, newVNode, container, anchor) {
    if (oldVNode == null) {
      // 初始化阶段不存在
      mountElement(newVNode, container, anchor)
    } else {
      // 更新逻辑
      patchElement(oldVNode, newVNode)
    }
  }

  /**
   * 挂载元素阶段到container
   */
  function mountElement(vnode, container, anchor) {
    // 创建文本节点
    // 设置文本内容
    // 设置文本props
    // 插入dom
    let { type, props, shapeFlag } = vnode
    const el = (vnode.el = hostCreateElement(type))
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else {
      // 不是文本阶段
    }
    if (vnode.props) {
      for (const key in vnode.props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    console.log(vnode)
    hostInsert(el, container, anchor)
  }

  function patchElement(oldVNode, newVNode) {
    const el = (newVNode.el = oldVNode.el) // 将旧元素保存到新的vnode上,避免重新创建元素
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    patchChildren(oldVNode, newVNode, el, null)
    patchProps(el, newVNode, oldProps, newProps)
    console.log(el, newVNode, oldVNode)
  }

  function patchChildren(oldVNode, newVNode, el, anchor) {
    const c1 = oldVNode.children
    const prevShapeFlag = oldVNode.shapeFlag || 0
    const c2 = newVNode.children
    const { shapeFlag } = newVNode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 如果新节点是文本节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 如果旧节点是数组节点
        // 卸载旧节点
      }
      if (c2 !== c1) {
        // 新旧节点的子节点不相同
        hostSetElementText(el, c2)
      }
    } else {
      // 如果新节点不是文本节点
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        //  如果旧节点是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 如果新节点也是数组
          // diff运算
        } else {
          // 新阶段不是数组
          // 卸载节点
        }
      } else {
        // 如果旧节点是文本节点
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧节点的文本
          hostSetElementText(el, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 新子节点的挂载
        }
      }
    }
  }

  function patchProps(el: Element, vnode, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 新的props替换旧的props
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
      // 删除旧的props中新props不存在的props
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  /**
   * 渲染节点的入口
   * @param oldVNode 旧节点
   * @param newVNode  新节点
   * @param container  容器
   * @param anchor 锚点
   * @returns
   */
  const patch = (oldVNode, newVNode, container, anchor = null) => {
    // 如果前后一致,则跳过本次阶段更新
    if (oldVNode === newVNode) {
      return
    }
    let { type, shapeFlag } = newVNode
    if (type === Text) {
      // 节点是文本
    } else if (type === Comment) {
      // 节点是注释
    } else if (type === Fragment) {
      // 节点是代码片段
    } else {
      // 节点是元素标签
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 子节点是string
        processElement(oldVNode, newVNode, container, anchor)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 子阶段是组件
      }
    }
  }

  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载
    } else {
      // 加载节点
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  return {
    render,
  }
}
