import { extend } from "@vue/shared";
import { generate } from "./codegen";
import { baseParse } from "./parse"
import { transform } from "./transform";
import { transformElement } from "./transforms/transformElement";
import { transformText } from "./transforms/transformText";
import { transformIf } from "./transforms/vIf";

export function baseCompile(template: string, options = {}) {
  const ast: ReturnType<typeof baseParse> = baseParse(template.trim())
  
  transform(ast, extend(options, {
    nodeTransforms: [
      transformElement,
      transformText,
      transformIf
    ]
  }))

  return generate(ast)
}