export const enum ShapeFlags {
  ELEMENT = 1, // 节点元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数组件
  STATEFUL_COMPONENT = 1 << 2, // 有状态组件
  TEXT_CHILDREN = 1 << 3, // 文本 子组件
  ARRAY_CHILDREN = 1 << 4, // 数组 子组件
  SLOTS_CHILDREN = 1 << 5, // 插槽 子组件
  TELEPORT = 1 << 6, // 传送门组件
  SUSPENSE = 1 << 7, // 异步组件
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 缓存组件
  COMPONENT_KEPT_ALIVE = 1 << 9, // 缓存组件
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 组件
}
