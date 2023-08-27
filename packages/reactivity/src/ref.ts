import { hasChange } from "@vue/shared"
import { ComputedRefImpl } from "./computed"
import { createDep, Dep } from "./dep"
import { activeEffect, trackEffects, triggerEffects } from "./effect"
import { toReactive } from "./reactive"

export interface Ref<T = any> {
  value: T
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, shallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }

  return new RefImpl(rawValue, shallow)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined

  public readonly __v_isRef = true

  constructor(
    value: T,
    public readonly __v_isShallow: boolean
  ) {
    this._rawValue = value
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal: T) {
    if (hasChange(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = toReactive(newVal)
      triggerRefValue(this)
    }
  }
}

export function trackRefValue<T>(ref: RefImpl<T> | ComputedRefImpl<T>) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue<T>(ref: RefImpl<T> | ComputedRefImpl<T>) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

export function isRef(r: any): r is Ref {
  return (r && r.__v_isRef === true)
}