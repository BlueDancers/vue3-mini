import { patchProp } from './patchProp'
import { nodeOps } from './nodeOpt'
import { extend } from '@vue-mini/shared'
import { createRenderer } from '@vue-mini/runtime-core'

const rendererOptions = extend({ patchProp }, nodeOps)

console.log(rendererOptions)

let renderer

/**
 * 在导出钱
 * @returns 
 */
function ensureRenderer() {
  if (!renderer) {
    renderer = createRenderer(rendererOptions)
  }
  return renderer
}

/**
 * 真正执行的render函数
 * @param args
 */
export function render(...args) {
  ensureRenderer().render(...args)
}
