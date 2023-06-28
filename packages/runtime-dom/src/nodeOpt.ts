const doc = document

export const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null)
  },
  createElement: (tag: string): Element => {
    const el = doc.createElement(tag)
    return el
  },
  setElementText: (el, text) => {
    el.textContent = text
  },
}
