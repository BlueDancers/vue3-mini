/**
 * patch相关事件
 * @param el
 * @param rawName
 * @param prevValue
 * @param nextValue
 */
export function patchEvent(el: Element & { _vei?: Object }, rawName, prevValue, nextValue) {
  // 事件缓存对象
  const invokers = el._vei || (el._vei = {})
  // 获取之前是否存在缓存数据
  const existingInvoker = invokers[rawName]
  if (nextValue && existingInvoker) {
    // 如果之前并且,并且本次有新的,则更新监听事件
    existingInvoker.value = nextValue
  } else {
    const name = parseName(rawName)
    if (nextValue) {
      // 缓存并添加监听事件
      const invoker = (invokers[rawName] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } else if (existingInvoker) {
      // 卸载监听事件
      el.removeEventListener(name, existingInvoker)
      invokers[rawName] = undefined
    }
  }
}

/**
 * 将事件去除on开头,并转化为小写
 * @param name
 * @returns
 */
function parseName(name: string) {
  return name.slice(2).toLowerCase()
}

/**
 * 创建可以监听的事件
 * 并将事件放入对象的value中,如果后续事件发生更新仅需更新函数的value
 * @param initalValue
 * @returns
 */
function createInvoker(initalValue) {
  const invoker: any = (e: Event) => {
    if (invoker.value) {
      invoker.value()
    }
  }
  invoker.value = initalValue
  return invoker
}
