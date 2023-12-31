import { isString } from "@vue/shared";
import { NodeTypes } from "./ast";
import { CREATE_ELEMENT_VNODE, CREATE_VNODE } from './runtimeHelpers'

export function isText(node) {
  return node.type === NodeTypes.INTERPOLATION
    || node.type === NodeTypes.TEXT
}

export function getVNodeHelper(ssr: boolean, isComponent: boolean) {
  return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE
}

export function isVSlot(p) {
  return p.type === NodeTypes.DIRECTIVE && p.name === 'slot'
}

export function getMemoedVNodeCall(node) {
	return node
}

export function createObjectExpression(properties) {
	return {
		type: NodeTypes.JS_OBJECT_EXPRESSION,
		loc: {},
		properties
	}
}

export function injectProp(node, prop) {
	let propsWithInjection
	let props =
		node.type === NodeTypes.VNODE_CALL ? node.props : node.arguments[2]

	if (props == null || isString(props)) {
		propsWithInjection = createObjectExpression([prop])
	}
	if (node.type === NodeTypes.VNODE_CALL) {
		node.props = propsWithInjection
	}
}
