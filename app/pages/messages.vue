<template>
  <!-- `min-h-full` fills the layout scroller, so the composer pins to the bottom
       without hardcoding the chrome height (it used to subtract 5.5rem). -->
  <div class="relative flex flex-col min-h-full">
    <div class="max-w-3xl mx-auto w-full px-4 pt-4 pb-0 flex flex-col flex-1 min-h-0">
      <div v-if="!token" class="text-sm text-muted-foreground text-center py-12">
        <NuxtLink to="/login" class="text-primary underline">Sign in with your access link</NuxtLink>
      </div>
      <template v-else>
        <div class="shrink-0 space-y-2 mb-3">
          <SegmentedControl
            v-model="activeChannel"
            :options="channelOptions"
            size="sm"
            shape="square"
            class="w-full"
            aria-label="Message channel"
          />
          <p class="text-xs text-muted-foreground">
            {{
              activeChannel === 'group'
                ? 'Messages visible to all linked family members and the agency.'
                : 'Only you and the agency see this thread.'
            }}
          </p>
        </div>

        <div
          ref="threadEl"
          class="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 pb-3"
        >
          <div v-if="loading" class="space-y-3 py-4">
            <div v-for="i in 4" :key="i" class="h-16 rounded-2xl bg-muted animate-pulse" />
          </div>
          <template v-else>
            <div
              v-for="(m, i) in thread"
              :key="m.id || i"
              class="flex"
              :class="m.direction === 'outbound' ? 'justify-start' : 'justify-end'"
            >
              <div
                class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm"
                :class="m.direction === 'outbound'
                  ? 'bg-muted/60 border border-border/60 rounded-bl-md'
                  : 'bg-luna-500/15 border border-luna-500/20 rounded-br-md'"
              >
                <p class="text-xs font-semibold text-muted-foreground mb-1">
                  {{ messageFromLabel(m) }}
                </p>
                <p class="whitespace-pre-wrap">{{ m.content }}</p>
                <p v-if="m.created_at || m.createdAt" class="text-xs text-muted-foreground mt-2">
                  {{ formatDt(m.created_at || m.createdAt || '') }}
                </p>
              </div>
            </div>
            <EmptyState
              v-if="!thread.length"
              title="No messages yet"
              description="Send a message to start the conversation with the agency."
              size="sm"
            />
          </template>
        </div>

        <div class="shrink-0 sticky bottom-0 pt-3 pb-4 border-t bg-background space-y-2">
          <label class="text-xs font-medium text-muted-foreground">
            {{ activeChannel === 'private' ? 'Message the agency (private)' : 'Message the agency' }}
          </label>
          <Textarea
            v-model="draft"
            rows="3"
            placeholder="Type your message…"
            class="min-h-[5.5rem]"
          />
          <div class="flex justify-end">
            <Button
              size="sm"
              class="min-h-10"
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
import {
  usePortalResourcesStore,
  type PortalMessageChannel,
  type PortalMsgRow,
} from '~/stores/portalResources'
import { normalizePortalError } from '~/composables/usePortalAuth'

definePageMeta({ title: 'Messages' })

const config = useRuntimeConfig()
const { token } = usePortalAuth()
const resources = usePortalResourcesStore()

const sending = ref(false)
const draft = ref('')
const activeChannel = ref<PortalMessageChannel>('group')
const threadEl = ref<HTMLElement | null>(null)
const loadError = ref(false)
const ready = ref(Boolean(resources.messages.group?.initialized))

const channelOptions = [
  { value: 'group' as const, label: 'Family & agency' },
  { value: 'private' as const, label: 'Private with agency' },
]

let socket: Socket | null = null

const loading = computed(() => {
  if (loadError.value) return false
  return !ready.value || resources.isMessagesLoading(activeChannel.value)
})
const thread = computed(() => resources.getMessages(activeChannel.value))

function messageFromLabel(m: PortalMsgRow) {
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

function scrollToBottom() {
  nextTick(() => {
    const el = threadEl.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

async function load() {
  if (!token.value) {
    ready.value = true
    return
  }
  loadError.value = false
  const ch = activeChannel.value
  if (resources.messages[ch]?.initialized) ready.value = true
  try {
    await resources.fetchMessages(ch)
    scrollToBottom()
  } catch (e: unknown) {
    loadError.value = true
    const err = e as { data?: { message?: unknown }; message?: string }
    toast.error(normalizePortalError(err?.data?.message) || err?.message || 'Could not load messages.')
  } finally {
    ready.value = true
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
    const msg = row as PortalMsgRow
    const ch = msg.channel_type === 'private' ? 'private' : 'group'
    resources.mergeMessage(ch, msg)
    if (ch === activeChannel.value) scrollToBottom()
  })
  socket.on('connect_error', (err) => {
    console.warn('[Family portal WS]', err.message)
  })
}

async function send() {
  if (!token.value || !draft.value.trim()) return
  sending.value = true
  try {
    await resources.postMessage(activeChannel.value, draft.value.trim())
    draft.value = ''
    scrollToBottom()
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

watch(thread, () => scrollToBottom(), { deep: true })

onMounted(() => {
  void load()
  connectSocket()
})

onBeforeUnmount(() => {
  socket?.disconnect()
  socket = null
})
</script>
