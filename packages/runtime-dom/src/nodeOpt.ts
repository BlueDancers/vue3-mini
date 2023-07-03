const doc = document

export const nodeOps = {
  createElement: (tag: string): Element => {
    const el = doc.createElement(tag)
    return el
  },
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null)
  },
  setElementText: (el, text) => {
    el.textContent = text
  },
  remove: (el: Element) => {
    let parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  },
  createText: (text: string) => {
    return doc.createTextNode(text)
  },
  setText: (el: Element, text: string) => {
    return (el.nodeValue = text)
  },
  createComment: (text: string) => {
    return doc.createComment(text)
  },
}
