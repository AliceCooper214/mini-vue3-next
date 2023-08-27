import { createRenderer } from '@vue/runtime-core'
import { extend, isString } from '@vue/shared';
import { nodeOps } from './nodeOps'
import { patchProp } from './patchProp';

const rendererOptions = extend({ patchProp }, nodeOps)

let renderer

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

export const render = (...args) => {
	ensureRenderer().render(...args)
}

export const createApp = (...args) => {
  console.log(ensureRenderer());
  
  const app = ensureRenderer().createApp(...args)

	const { mount } = app
	app.mount = (containerOrSelector: Element | string) => {
		const container = normalizeContainer(containerOrSelector)
		if (!container) return
		mount(container)
	}

	return app
}

function normalizeContainer(container: Element | string): Element | null {
	if (isString(container)) {
		const res = document.querySelector(container)
		return res
	}
	return container
}

export { nodeOps } from './nodeOps'