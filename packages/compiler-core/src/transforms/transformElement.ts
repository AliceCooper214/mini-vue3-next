import { createVNodeCall, NodeTypes } from '../ast'
import { TransformContext } from '../transform'

export const transformElement = (node, context: TransformContext) => {
  return function postTransformElement() {
    node = context.currentNode!

    if (node.type !== NodeTypes.ELEMENT) {
      return
    }

    const { tag } = node

    let vnodeTag = `"${tag}"`
    let vnodeProps = []
    let vnodeChildren = node.children

    node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren
    )
  }
}
