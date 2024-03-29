import { ShapeFlags } from 'packages/shared/src/shapeFlags'
import { Comment, Fragment, Text, isSameVNodeType } from './vnode'
import { EMPTY_OBJ, isString } from 'packages/shared/src'
import { normalizeVNode, rednerComponentRoot } from './componentRenderUtils'
import { createComponentInstance, setupComponent } from './component'
import { ReactiveEffect } from 'packages/reactivity/src'
import { queuePreFlushCb } from './scheduler'

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
   * 创建元素
   * @param type
   */
  createElement(type: string)
  /**
   * 插入指定el到parent的指定位置
   * @param el 元素
   * @param parent 父节点
   * @param anchor 指定位置
   */
  insert(el, parent: Element, anchor?): void
  /**
   * 指定元素设置文本
   * @param node
   * @param text
   */
  setElementText(node: Element, text: string): void
  /**
   * 移除元素
   * @param type
   */
  remove(type: Element)
  /**
   * 创建文本节点
   */
  createText(text: string): void
  /**
   * 更新文本节点
   */
  setText(el: Element, text: string): void
  /**
   * 创建备注节点
   */
  createComment(text: string): void
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
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment,
  } = options

  /**
   * 处理Text类型的Vnode
   */
  function processText(oldVNode, newVNode, container, anchor) {
    if (oldVNode == null) {
      // 挂载
      newVNode.el = hostCreateText(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      // 更新
      const el = (newVNode.el = oldVNode.el)
      if (newVNode.children != oldVNode.children) {
        hostSetText(el, newVNode.children)
      }
    }
  }

  function processCommentNode(oldVNode, newVNode, container, anchor) {
    console.log('注释节点')
    if (oldVNode == null) {
      newVNode.el = hostCreateComment(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      // vue3并没有给comment组件增加更新逻辑,所以即使comment组件发生变化,也不会更新注释内容
      newVNode.el = oldVNode.el
    }
  }

  function processFragment(oldVNode, newVNode, container, anchor) {
    if (oldVNode === null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  /**
   * 处理html标签的原生标签
   */
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
   * 处理html标签中的组件
   * @param oldVNode
   * @param newVNode
   * @param container
   * @param anchor
   */
  function processComponent(oldVNode, newVNode, container, anchor) {
    if (oldVNode == null) {
      mountComponent(newVNode, container, anchor)
    } else {
      console.log('更新操作')
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

  /**
   * 挂载组件
   */
  function mountComponent(initialVNode, container, anchor) {
    // initialVNode就是组件的vnode本身
    // createComponentInstance构建了一个组件的必要对象
    initialVNode.component = createComponentInstance(initialVNode)
    const instance = initialVNode.component

    // 绑定render函数，经过这行代码，instance的render就等于type.render
    setupComponent(instance)
    // 渲染页面
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  /**
   * 将组件渲染到页面
   */
  function setupRenderEffect(instance, initialVNode, container, anchor) {
    // instance是组件本身，本函数，将组件的必要函数都进行了填充以及组件的挂在操作
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const { bm, m } = instance

        if (bm) {
          bm()
        }

        console.log('首次挂载')
        const subTree = (instance.subTree = rednerComponentRoot(instance))

        patch(null, subTree, container, anchor)
        // 将组件的el保存到组件的component中，也就是initialVNode
        initialVNode.el = subTree.el

        if (m) {
          m()
        }
      } else {
        console.log('更新组件')
      }
    }
    //
    instance.effect = new ReactiveEffect(componentUpdateFn, () => queuePreFlushCb(update))
    const effect = instance.effect

    instance.update = () => effect.run()
    const update = instance.update

    update()
  }

  /**
   * 创建子节点
   */
  function mountChildren(children, container, anchor) {
    if (isString(children)) {
      children = children.split('')
    }

    for (let i = 0; i < children.length; i++) {
      // 如果children的类型是string,则
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

  /**
   * 更新子节点
   */
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
    // 如果旧节点存在,并且新旧节点不一致,则卸载旧节点
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    let { type, shapeFlag } = newVNode
    console.log('type', type)

    if (type === Text) {
      // 文本节点
      processText(oldVNode, newVNode, container, anchor)
    } else if (type === Comment) {
      // 注释节点
      processCommentNode(oldVNode, newVNode, container, anchor)
    } else if (type === Fragment) {
      // 片段节点
      processFragment(oldVNode, newVNode, container, anchor)
    } else {
      // 节点是元素标签
      if (shapeFlag & ShapeFlags.ELEMENT) {
        // 子节点是string
        processElement(oldVNode, newVNode, container, anchor)
      } else if (shapeFlag & ShapeFlags.COMPONENT) {
        // 子节点是组件
        console.log('开始组件的挂载')
        processComponent(oldVNode, newVNode, container, anchor)
      }
    }
  }

  function unmount(vnode) {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if (vnode == null) {
      // 卸载
      if (container._vnode) {
        unmount(vnode)
      }
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
