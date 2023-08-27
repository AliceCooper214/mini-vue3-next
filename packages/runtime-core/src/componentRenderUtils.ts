import { ShapeFlags } from "@vue/shared"
import { createVNode, Text } from "./vnode"

export function renderComponentRoot(instance) {
  const { vnode, render, data = {} } = instance

  let result
  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      result = normalizeVNode(render!.call(data, data))
    }
  } catch (error) {
    console.error(`[Vue-next-mini]: ${(error as Error).message}`)
  }

  return result
}

export function normalizeVNode(child) {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

function cloneIfMounted(child: any) {
  return child
}
