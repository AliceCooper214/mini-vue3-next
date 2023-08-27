import { LifecycleHooks } from "./component"

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)

export function injectHook(
  type: LifecycleHooks,
  hook: Function,
  target
): Function | undefined {
  if (target) {
    target[type] = hook
    return hook
  }
}

function createHook(lifecycle: LifecycleHooks) {
  return (hook, target) => injectHook(lifecycle, hook, target)
}
