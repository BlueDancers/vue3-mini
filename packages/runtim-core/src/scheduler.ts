/**
 * 实现调度队列
 */

/**
 * 当前刷新状态
 */
let isFlushPending = false

/**
 * 微任务触发器
 */
const resolvePromise = Promise.resolve()

/**
 * dom渲染前的微任务保存处
 */
const pendingPreFlushCbs: Function[] = []

/**
 * 当前等待执行的微任务
 */
let currentFlushPromise: Promise<void> | null = null

/**
 * 异步队列添加入口
 * @param cb 函数
 */
export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs)
}

/**
 * 将函数加入到微任务队列中
 * @param cb
 * @param pendingQueue
 */
function queueCb(cb: Function, pendingQueue: Function[]) {
  pendingQueue.push(cb)
  queueFlush()
}

/**
 * 将微任务队列中的数据加入到微任务中
 */
function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    // 主线程执行完毕后,才会执行这里的微任务
    currentFlushPromise = resolvePromise.then(flushJobs)
  }
}

/**
 * 若干时间后,一轮事件循环结束,开始执行下一轮的微任务
 */
function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}

export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    console.log('activePreFlushCbs', activePreFlushCbs)

    pendingPreFlushCbs.length = 0
    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}
