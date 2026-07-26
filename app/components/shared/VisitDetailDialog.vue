<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent
      size="full"
      class="sm:max-w-lg max-h-[90dvh] max-sm:max-h-dvh max-sm:rounded-none"
    >
      <DialogHeader>
        <DialogTitle>Visit detail</DialogTitle>
        <DialogDescription class="sr-only">
          Details, photos and notes for this care visit.
        </DialogDescription>
      </DialogHeader>
      <SharedVisitDetailContent
        v-if="visitId"
        :visit-id="visitId"
        :seed="seed"
      />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'

const { open, visitId, seed, close } = useFamilyVisitDetail()

function onOpenChange(next: boolean) {
  if (!next) close()
}
</script>
