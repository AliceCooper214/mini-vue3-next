import {
  createCallExpression,
  createConditionalExpression,
  createObjectProperty,
  createSimpleExpression,
  NodeTypes
} from '../ast'
import { CREATE_COMMENT } from '../runtimeHelpers'
import {
  createStructuralDirectiveTransform,
  TransformContext
} from '../transform'
import {
  getMemoedVNodeCall,
  injectProp
} from '../utils'

export const transformIf = createStructuralDirectiveTransform(
  /^(if|else|else-if)$/,
  (node, dir, context) => {
    return processIf(node, dir, context, (ifNode, branch, isRoot) => {
      let key = 0

      return () => {
        if (isRoot) {
          ifNode.codegenNode = createCodegenNodeForBranch(branch, key, context)
        } else {
          // TODO: 非根
        }
      }
    })
  }
)

export function processIf(
  node,
  dir,
  context: TransformContext,
  processCodegen?: (node, branch, isRoot: boolean) => (() => void) | undefined
) {
  if (dir.name === "if") {
    const branch = createIfBranch(node, dir)
    const ifNode = {
      type: NodeTypes.IF,
      loc: node.loc,
      branches: [branch]
    }
    context.replaceNode(ifNode)
    if (processCodegen) {
      return processCodegen(ifNode, branch, true)
    }
  }
}

function createIfBranch(node, dir) {
  return {
    type: NodeTypes.IF_BRANCH,
    loc: node.loc,
    condition: dir.exp,
    children: [node]
  }
}

function createCodegenNodeForBranch(
  branch: any,
  keyIndex: number,
  context: TransformContext
) {
  if (branch.condition) {
    return createConditionalExpression(
      branch.condition,
      createChildrenCodegenNode(branch, keyIndex),
      createCallExpression(context.helper(CREATE_COMMENT), ['"v-if"', 'true'])
    )
  } else {
    return createChildrenCodegenNode(branch, keyIndex)
  }
}

function createChildrenCodegenNode(branch, keyIndex: number) {
  const keyProperty = createObjectProperty(
    `key`,
    createSimpleExpression(`${keyIndex}`, false)
  )
  const { children } = branch
  const firstChild = children[0]

  const ret = firstChild.codegenNode
  const vnodeCall = getMemoedVNodeCall(ret)

  injectProp(vnodeCall, keyProperty)
  return ret
}
