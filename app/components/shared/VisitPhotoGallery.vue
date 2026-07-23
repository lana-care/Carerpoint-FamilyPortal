<template>
  <div>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="(p, i) in photos"
        :key="p.id"
        type="button"
        class="group relative aspect-square overflow-hidden rounded-md border bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary"
        @click="open(i)"
      >
        <img
          v-if="p.url"
          :src="p.url"
          :alt="p.caption || 'Visit photo'"
          loading="lazy"
          class="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span v-else class="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
          Unavailable
        </span>
      </button>
    </div>

    <Dialog v-model:open="isOpen">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle class="text-sm">
            {{ active?.caption || 'Visit photo' }}
          </DialogTitle>
        </DialogHeader>
        <div class="space-y-3">
          <img
            v-if="active?.url"
            :src="active.url"
            :alt="active?.caption || 'Visit photo'"
            class="max-h-[60vh] w-full rounded-md object-contain"
          />
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ subtitle }}</span>
            <span v-if="photos.length > 1" class="tabular-nums">{{ activeIndex + 1 }} / {{ photos.length }}</span>
          </div>
          <div v-if="photos.length > 1" class="flex justify-between gap-2">
            <Button variant="outline" size="sm" @click="step(-1)">← Previous</Button>
            <Button variant="outline" size="sm" @click="step(1)">Next →</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'

export interface VisitPhoto {
  id: string
  url: string | null
  caption?: string | null
  takenAt?: string | null
  createdAt?: string | null
  carerFirstName?: string | null
}

const props = defineProps<{ photos: VisitPhoto[] }>()

const isOpen = ref(false)
const activeIndex = ref(0)
const active = computed(() => props.photos[activeIndex.value] ?? null)

const subtitle = computed(() => {
  const p = active.value
  if (!p) return ''
  const parts: string[] = []
  if (p.carerFirstName) parts.push(`Added by ${p.carerFirstName}`)
  const when = p.takenAt || p.createdAt
  if (when) {
    try {
      parts.push(new Date(when).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }))
    } catch {
      /* ignore */
    }
  }
  return parts.join(' · ')
})

function open(i: number) {
  activeIndex.value = i
  isOpen.value = true
}

function step(delta: number) {
  const n = props.photos.length
  if (n === 0) return
  activeIndex.value = (activeIndex.value + delta + n) % n
}
</script>
