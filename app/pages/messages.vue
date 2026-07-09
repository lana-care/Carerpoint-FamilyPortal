<template>
  <div class="min-h-screen bg-background">
    <header class="glass-bar border-b border-border/60 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Messages</h1>
    </header>
    <div class="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div v-if="!token" class="text-sm text-muted-foreground text-center py-12">
        <NuxtLink to="/login" class="text-primary underline">Sign in with your access link</NuxtLink>
      </div>
      <template v-else>
        <div class="flex rounded-lg border p-1 bg-muted/30 gap-1">
          <button
            type="button"
            class="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors"
            :class="
              activeChannel === 'group'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeChannel = 'group'"
          >
            Family &amp; agency
          </button>
          <button
            type="button"
            class="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors"
            :class="
              activeChannel === 'private'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="activeChannel = 'private'"
          >
            Private with agency
          </button>
        </div>
        <p class="text-[11px] text-muted-foreground">
          {{
            activeChannel === 'group'
              ? 'Messages visible to all linked family members and the agency.'
              : 'Only you and the agency see this thread.'
          }}
        </p>
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(m, i) in thread"
            :key="m.id || i"
            class="rounded-lg border p-3 text-sm"
            :class="m.direction === 'inbound' ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'"
          >
            <p class="text-xs font-semibold text-muted-foreground mb-1">
              {{ messageFromLabel(m) }}
            </p>
            <p class="whitespace-pre-wrap">{{ m.content }}</p>
            <p v-if="m.created_at" class="text-[10px] text-muted-foreground mt-2">
              {{ formatDt(m.created_at) }}
            </p>
          </div>
          <div v-if="!thread.length" class="text-sm text-muted-foreground text-center py-8">
            No messages in this thread yet.
          </div>
        </div>
        <div class="pt-4 border-t space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            {{ activeChannel === 'private' ? 'Message the agency (private)' : 'Message the agency' }}
          </label>
          <Textarea
            v-model="draft"
            rows="3"
            placeholder="Type your message…"
          />
          <div class="flex justify-end">
            <Button
              size="sm"
              :disabled="sending || !draft.trim()"
              @click="send"
            >
              {{ sending ? 'Sending…' : 'Send' }}
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { io, type Socket } from 'socket.io-client'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'

definePageMeta({ layout: false })

type MsgRow = {
  id?: string
  content?: string
  direction?: string
  created_at?: string
  channel_type?: string
  sender_name?: string | null
}

const config = useRuntimeConfig()
const { token, fetchPortal, portalData } = usePortalAuth()

const loading = ref(true)
const sending = ref(false)
const draft = ref('')
const thread = ref<MsgRow[]>([])
const activeChannel = ref<'group' | 'private'>('group')

let socket: Socket | null = null

function messageChannel(row: MsgRow): 'group' | 'private' {
  return row.channel_type === 'private' ? 'private' : 'group'
}

function messageFromLabel(m: MsgRow) {
  if (m.direction === 'outbound') return 'Agency'
  const n = (m.sender_name || '').trim()
  return n || 'Family member'
}

function formatDt(s: string) {
  try {
    return new Date(s).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return s
  }
}

function mergeMessage(row: MsgRow) {
  if (!row?.id && !row?.content) return
  if (messageChannel(row) !== activeChannel.value) return
  const exists = thread.value.some((m) => row.id && m.id === row.id)
  if (exists) return
  thread.value = [...thread.value, row]
}

async function load() {
  if (!token.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const ch = activeChannel.value
    const res = await $fetch<{ valid?: boolean; messages?: MsgRow[] }>(
      `${base}/api/v1/family-portal/messages?channel=${ch}`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    if (res?.valid && Array.isArray(res.messages)) {
      thread.value = res.messages
    } else {
      await fetchPortal()
      const all = (portalData.value?.messages as MsgRow[]) || []
      thread.value = all.filter((m) => messageChannel(m) === ch)
    }
  } catch (e: unknown) {
    thread.value = []
    const err = e as { data?: { message?: unknown }; message?: string }
    toast.error(normalizePortalError(err?.data?.message) || err?.message || 'Could not load messages.')
  } finally {
    loading.value = false
  }
}

function connectSocket() {
  socket?.disconnect()
  socket = null
  const tok = token.value
  if (!tok) return
  const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
  socket = io(`${base}/ws`, {
    path: '/socket.io',
    auth: { portalToken: tok },
    transports: ['websocket', 'polling'],
  })
  socket.on('family_message:new', (row: unknown) => {
    const r = row as MsgRow
    mergeMessage(r)
  })
  socket.on('connect_error', (err) => {
    console.warn('[Family portal WS]', err.message)
  })
}

async function send() {
  if (!token.value || !draft.value.trim()) return
  sending.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ success?: boolean; error?: string }>(
      `${base}/api/v1/family-portal/messages`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
        body: {
          message: draft.value.trim(),
          channel_type: activeChannel.value,
        },
      },
    )
    if (!res?.success) {
      toast.error(res?.error || 'Could not send message.')
      return
    }
    draft.value = ''
    await load()
    await fetchPortal()
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    toast.error(normalizePortalError(err?.data?.message) || err?.message || 'Could not send message.')
  } finally {
    sending.value = false
  }
}

watch(activeChannel, () => {
  void load()
})

onMounted(() => {
  void load().then(() => {
    connectSocket()
  })
})

onBeforeUnmount(() => {
  socket?.disconnect()
  socket = null
})
</script>
