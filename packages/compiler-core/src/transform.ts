import { isArray, isString } from "@vue/shared"
import { ElementTypes, NodeTypes } from "./ast"
import { isSingleElementRoot } from "./transforms/hoistStatic"
import { TO_DISPLAY_STRING } from "./runtimeHelpers"
import { isVSlot } from "./utils"

export interface TransformContext {
  root
  parent: ParentNode | null
  childIndex: number
  currentNode
  helpers: Map<symbol, number>
  helper<T extends symbol>(name: T): T
  nodeTransforms: any[]
  replaceNode(node): void
}

export function createTransformContext(
  root,
  { nodeTransforms = [] }
): TransformContext {
  const context: TransformContext = {
    nodeTransforms,

    root,
    helpers: new Map(),
    currentNode: root,
    parent: null,
    childIndex: 0,

    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    replaceNode(node) {
      context.parent!.children[context.childIndex] = context.currentNode = node
    },
  }

  return context
}

export function transform(root, options) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
  root.components = []
  root.directives = []
  root.imports = []
  root.hoists = []
  root.temps = []
  root.cached = []
}

export function traverseNode(node, context: TransformContext) {
  context.currentNode = node
  const { nodeTransforms } = context
  const exitFns: any = []

  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      if (isArray(onExit)) {
        exitFns.push(...onExit)
      } else {
        exitFns.push(onExit)
      }
    }

    if (!context.currentNode) {
      return
    } else {
      node = context.currentNode
    }
  }

  switch (node.type) {
    case NodeTypes.IF_BRANCH:
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context)
      break
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.IF:
      for (let i = 0; i < node.branches.length; i++) {
        traverseNode(node.branches[i], context)
      }
      break
  }

  context.currentNode = node
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

export function traverseChildren(parent, context: TransformContext) {
  parent.children.forEach((node, index) => {
    context.parent = parent
    context.childIndex = index
    traverseNode(node, context)
  });
}

function createRootCodegen(root) {
  const { children } = root

  if (children.length === 1) {
    const child = children[0]
    if (isSingleElementRoot(root, child) && child.codegenNode) {
      const codegenNode = child.codegenNode
      root.codegenNode = codegenNode
    }
  }
}

export function createStructuralDirectiveTransform(name: string | RegExp, fn) {
  const matches = isString(name)
    ? (n: string) => n === name
    : (n: string) => name.test(n)

  return (node, context) => {
    if (node.type === NodeTypes.ELEMENT) {
      const { props } = node

      if (node.tagType === ElementTypes.TEMPLATE && props.some(isVSlot)) {
        return
      }

      const exitFns: any = []
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (prop.type === NodeTypes.DIRECTIVE && matches(prop.name)) {
          props.splice(i, 1)
          i--
          const onExit = fn(node, prop, context)
          if (onExit) exitFns.push(onExit)
        }
      }

      return exitFns
    }
  }
}