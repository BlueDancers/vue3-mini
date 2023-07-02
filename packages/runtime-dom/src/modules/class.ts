export function patchClass(el: Element, value: string | null) {
  if (value === null) {
    el.removeAttribute('class')
  } else {
    // TODO: 为什么使用className而不是setAttribute?
    // el.className是Dom的特性(properties),这是直接访问Dom树,进行简单的复制
    // el.setAttribute是HTML属性(attribute),这是调用API方法,底层会更加复杂,例如创建一个新的attribute对象在插入到指定dom
    // 所以className的性能更加好,vue3源码中使用了该实现方式
    el.className = value
  }
}
