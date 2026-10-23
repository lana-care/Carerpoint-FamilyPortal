<script setup lang="ts">
import { computed } from 'vue'
import { iconAttrs } from '~/lib/cp-icons/core'
import { icons, type CpIconName } from '~/lib/cp-icons/nodes'
import type { CpIconAnimate, CpIconTone } from '~/lib/cp-icons/types'

/**
 * CpIcon — a CarerPoint icon (vendored @lana-care/icons, see
 * scripts/vendor-cp-icons.ts): outline in currentColor + lime accent,
 * animated on hover/focus of the control around it (icons.css).
 *
 * `name` is a string because sidebar and content icons come from content
 * data; tests/cp-icons.test.ts checks every name used exists.
 */
const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    tone?: CpIconTone
    animate?: CpIconAnimate
    label?: string
  }>(),
  { size: 24, tone: 'duo', animate: undefined, label: undefined },
)

const node = computed(() => icons[props.name as CpIconName])
const attrs = computed(() => (node.value ? iconAttrs(node.value, props) : null))
const layers = computed(() => (node.value?.order === 'sp' ? (['s', 'p'] as const) : (['p', 's'] as const)))

if (import.meta.dev && !node.value) console.warn(`[CpIcon] unknown icon "${props.name}"`)
</script>

<template>
  <svg v-if="node && attrs" v-bind="attrs.root" :style="attrs.style" focusable="false">
    <title v-if="label">{{ label }}</title>
    <g v-for="layer in layers" :key="layer" v-bind="attrs[layer]">
      <component :is="el[0]" v-for="(el, i) in node[layer]" :key="i" v-bind="el[1]" />
    </g>
  </svg>
</template>
