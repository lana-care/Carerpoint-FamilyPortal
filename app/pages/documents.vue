<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 rounded-xl bg-muted animate-pulse" />
      </div>

      <EmptyState
        v-else-if="error"
        title="Could not load documents"
        :description="error"
        size="sm"
      />

      <EmptyState
        v-else-if="!rows.length"
        title="No documents shared yet"
        description="Your care provider can publish reports and letters here when available."
        :icon="LucideFileText"
        size="sm"
      />

      <ul v-else class="space-y-2">
        <li
          v-for="doc in rows"
          :key="doc.id"
          class="rounded-lg border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="min-w-0">
            <p class="font-medium text-sm">{{ doc.title || 'Document' }}</p>
            <p v-if="doc.document_type || doc.documentType" class="text-xs text-muted-foreground capitalize">
              {{ doc.document_type || doc.documentType }}
            </p>
            <p v-if="doc.created_at || doc.createdAt" class="text-xs text-muted-foreground mt-1">
              {{ formatDate(doc.created_at || doc.createdAt) }}
            </p>
          </div>
          <Button
            v-if="fileUrl(doc)"
            variant="outline"
            size="sm"
            class="shrink-0 min-h-10"
            @click="openDoc(doc)"
          >
            Open
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText as LucideFileText } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { usePortalResourcesStore, type PortalDocRow } from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'

definePageMeta({ title: 'Shared documents' })

const { token, fetchPortal, portalData } = usePortalAuth()
const resources = usePortalResourcesStore()

const error = ref<string | null>(null)
const ready = ref(resources.documents.initialized)
const rows = computed(() => resources.getDocuments)
const loading = computed(() => (!ready.value || resources.isDocumentsLoading) && !error.value)

function fileUrl(d: PortalDocRow): string | null {
  const u = d.file_url || d.fileUrl
  return u && String(u).trim() ? String(u) : null
}

function openDoc(d: PortalDocRow) {
  const url = fileUrl(d)
  if (url) window.open(url, '_blank', 'noopener,noreferrer')
}

function formatDate(d: string | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  if (!token.value) {
    error.value = 'No access token. Open the link from your email first.'
    ready.value = true
    return
  }
  if (!portalData.value?.valid) {
    await fetchPortal()
  }
  if (!portalData.value?.valid) {
    error.value = portalData.value?.error || 'Invalid or expired access link.'
    ready.value = true
    return
  }

  try {
    await resources.fetchDocuments()
    error.value = null
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    error.value = normalizePortalError(err?.data?.message) || err?.message || 'Could not load documents.'
  } finally {
    ready.value = true
  }
})
</script>
