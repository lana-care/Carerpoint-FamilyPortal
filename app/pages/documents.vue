<template>
  <div class="min-h-screen bg-background">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Shared documents</h1>
    </header>

    <div class="max-w-3xl mx-auto px-4 py-8">
      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>

      <div v-else-if="error" class="text-center text-sm text-destructive py-12">
        {{ error }}
      </div>

      <div v-else-if="!rows.length" class="text-center text-sm text-muted-foreground">
        <LucideFileText class="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p>No documents have been shared with you yet.</p>
        <p class="mt-2 text-xs">Your care provider can publish reports and letters here when available.</p>
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="doc in rows"
          :key="doc.id"
          class="rounded-lg border bg-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
        >
          <div>
            <p class="font-medium text-sm">{{ doc.title || 'Document' }}</p>
            <p v-if="doc.document_type || doc.documentType" class="text-xs text-muted-foreground capitalize">
              {{ doc.document_type || doc.documentType }}
            </p>
            <p v-if="doc.created_at || doc.createdAt" class="text-[10px] text-muted-foreground mt-1">
              {{ formatDate(doc.created_at || doc.createdAt) }}
            </p>
          </div>
          <a
            v-if="fileUrl(doc)"
            :href="fileUrl(doc)!"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-primary font-medium shrink-0 hover:underline"
          >
            Open
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText as LucideFileText } from 'lucide-vue-next'

definePageMeta({ layout: false })

interface DocRow {
  id: string
  title?: string
  file_url?: string
  fileUrl?: string
  document_type?: string
  documentType?: string
  created_at?: string
  createdAt?: string
}

interface DocumentsResponse {
  valid?: boolean
  error?: string
  data?: DocRow[]
}

const config = useRuntimeConfig()
const { token, fetchPortal, portalData } = usePortalAuth()

const loading = ref(true)
const error = ref<string | null>(null)
const rows = ref<DocRow[]>([])

function fileUrl(d: DocRow): string | null {
  const u = d.file_url || d.fileUrl
  return u && String(u).trim() ? String(u) : null
}

function formatDate(d: string | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  if (!token.value) {
    error.value = 'No access token. Open the link from your email first.'
    loading.value = false
    return
  }
  if (!portalData.value?.valid) {
    await fetchPortal()
  }
  if (!portalData.value?.valid) {
    error.value = portalData.value?.error || 'Invalid or expired access link.'
    loading.value = false
    return
  }

  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<DocumentsResponse>(
      `${base}/api/v1/family-portal/documents`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    if (!res?.valid) {
      error.value = res?.error || 'Could not load documents.'
      rows.value = []
    } else {
      rows.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message || err?.message || 'Could not load documents.'
    rows.value = []
  } finally {
    loading.value = false
  }
})
</script>
