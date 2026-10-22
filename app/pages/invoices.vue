<template>
  <div class="relative">
    <div class="max-w-3xl mx-auto px-4 py-8">
      <p class="text-sm text-muted-foreground mb-4">{{ $t('invoices.intro') }}</p>

      <div v-if="loading" class="space-y-3" aria-busy="true">
        <div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-muted animate-pulse" />
      </div>

      <EmptyState
        class="glass-card hairline-border rounded-2xl"
        v-else-if="error"
        role="alert"
        :title="$t('invoices.errorTitle')"
        :description="error"
        size="sm"
      />

      <EmptyState
        class="glass-card hairline-border rounded-2xl"
        v-else-if="!rows.length"
        :title="$t('invoices.emptyTitle')"
        :description="$t('invoices.emptyBody')"
        :icon="CpInvoice"
        size="sm"
      />

      <ul v-else class="glass-card hairline-border rounded-2xl divide-y divide-border/50 overflow-hidden">
        <li
          v-for="inv in rows"
          :key="inv.id"
          class="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div class="min-w-0 space-y-1">
            <p class="font-medium text-sm">
              {{ $t(inv.kind === 'credit_note' ? 'invoices.creditNote' : 'invoices.invoice') }} {{ inv.number }}
            </p>
            <p v-if="inv.period_start" class="text-xs text-muted-foreground">
              {{ $t('invoices.period', { from: formatDate(inv.period_start), to: formatDate(inv.period_end) }) }}
            </p>
            <p v-if="inv.kind === 'invoice' && inv.due_date" class="text-xs text-muted-foreground">
              {{ $t('invoices.due', { date: formatDate(inv.due_date) }) }}
            </p>
          </div>
          <div class="flex items-center gap-3 sm:justify-end">
            <div class="text-right">
              <p class="text-sm font-semibold tabular-nums">{{ formatMoney(inv.total_pence) }}</p>
              <p v-if="inv.kind === 'invoice' && inv.balance_pence > 0 && inv.balance_pence !== inv.total_pence" class="text-xs text-muted-foreground tabular-nums">
                {{ $t('invoices.balance', { amount: formatMoney(inv.balance_pence) }) }}
              </p>
            </div>
            <span
              v-if="inv.kind === 'invoice'"
              class="text-[11px] font-medium rounded-full px-2 py-0.5 border"
              :class="toneClass(inv.display_status)"
            >
              {{ $t(`invoices.status.${safeStatus(inv.display_status)}`) }}
            </span>
            <Button
              variant="outline"
              size="sm"
              class="shrink-0 min-h-10"
              :disabled="downloading === inv.id"
              :aria-label="$t('invoices.downloadLabel', { number: inv.number })"
              @click="download(inv)"
            >
              <CpDownload class="h-4 w-4 mr-1.5" />{{ $t('invoices.download') }}
            </Button>
          </div>
        </li>
      </ul>
      <p v-if="downloadError" class="mt-3 text-sm text-destructive" role="alert">{{ downloadError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CpInvoice, CpDownload } from '@lana-care/icons'
import { Button } from '~/components/ui/button'
import { usePortalResourcesStore, type PortalInvoiceRow } from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'
import { formatMoney, invoiceTone, safeStatus } from '~/utils/portalInvoices'

definePageMeta({ titleKey: 'portal.invoicesTitle' })

const { t } = useI18n()
const { token, fetchPortal, portalData } = usePortalAuth()
const resources = usePortalResourcesStore()

const error = ref<string | null>(null)
const downloadError = ref<string | null>(null)
const downloading = ref<string | null>(null)
const ready = ref(resources.invoices.initialized)
const rows = computed(() => resources.getInvoices)
const loading = computed(() => (!ready.value || resources.isInvoicesLoading) && !error.value)

function formatDate(d: string | null | undefined) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toneClass(status: string) {
  switch (invoiceTone(status)) {
    case 'success': return 'bg-emerald-100 text-emerald-700 border-transparent dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'warning': return 'bg-amber-100 text-amber-700 border-transparent dark:bg-amber-900/30 dark:text-amber-300'
    case 'danger': return 'bg-red-100 text-red-700 border-transparent dark:bg-red-900/30 dark:text-red-300'
    default: return 'bg-secondary text-secondary-foreground border-transparent'
  }
}

async function download(inv: PortalInvoiceRow) {
  downloading.value = inv.id
  downloadError.value = null
  try {
    await resources.downloadInvoicePdf(inv)
  } catch {
    downloadError.value = t('invoices.downloadFailed')
  } finally {
    downloading.value = null
  }
}

onMounted(async () => {
  if (!token.value) {
    error.value = t('invoices.noToken')
    ready.value = true
    return
  }
  if (!portalData.value?.valid) {
    await fetchPortal()
  }
  if (!portalData.value?.valid) {
    error.value = portalData.value?.error || t('invoices.invalidLink')
    ready.value = true
    return
  }

  try {
    await resources.fetchInvoices()
    error.value = null
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    error.value = normalizePortalError(err?.data?.message) || err?.message || t('invoices.loadFailed')
  } finally {
    ready.value = true
  }
})
</script>
