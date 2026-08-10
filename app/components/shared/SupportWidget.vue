<template>
  <!-- Launcher -->
  <Transition name="fab">
    <button
      v-if="!isOpen"
      aria-label="Open support chat"
      class="fixed z-40 bottom-5 right-5 sm:bottom-6 sm:right-6 w-14 h-14 rounded-full bg-luna-500 hover:bg-luna-600 text-white shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
      @click="open"
    >
      <LucideMessageCircle class="w-6 h-6" />
      <span
        v-if="unread > 0"
        class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold leading-5 text-center border-2 border-white dark:border-background"
      >{{ unread > 9 ? '9+' : unread }}</span>
    </button>
  </Transition>

  <!-- Panel -->
  <Transition name="chat-slide">
    <div
      v-if="isOpen"
      class="fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[380px] h-[100dvh] sm:h-auto sm:max-h-[calc(100dvh-40px)] rounded-none sm:rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/40 overflow-hidden flex flex-col bg-background border border-border"
    >
      <div class="support-header relative overflow-hidden shrink-0 px-5 pt-4 pb-5">
        <div class="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5" />
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <span class="text-white/90 font-semibold text-sm">CarerPoint Support</span>
            <button
              class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Minimise support chat"
              @click="isOpen = false"
            >
              <LucideChevronDown class="w-5 h-5 text-white" />
            </button>
          </div>
          <h2 class="text-white text-lg font-bold leading-tight">Need a hand?</h2>
          <p class="text-white/70 text-sm mt-1 leading-relaxed">
            Questions about using this portal — we'll reply here and by email.
          </p>
        </div>
      </div>

      <div class="flex-1 flex flex-col bg-background overflow-hidden min-h-0">
        <!-- Ask for an email once. There is no login here to take it from, and
             without a reply address the conversation is write-only. -->
        <form v-if="!thread.token" class="p-4 space-y-3 overflow-y-auto" @submit.prevent="start">
          <div>
            <label class="text-xs font-semibold text-muted-foreground mb-1 block">Your email</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-luna-500/30 focus:border-luna-500 transition-colors"
            >
          </div>
          <div>
            <label class="text-xs font-semibold text-muted-foreground mb-1 block">How can we help?</label>
            <textarea
              v-model="form.message"
              required
              rows="5"
              placeholder="Tell us what you need…"
              class="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-luna-500/30 focus:border-luna-500 transition-colors"
            />
          </div>
          <p v-if="form.error" class="text-xs text-red-600 dark:text-red-400">{{ form.error }}</p>
          <button
            type="submit"
            :disabled="form.sending || !formValid"
            class="w-full py-2.5 rounded-xl bg-luna-500 hover:bg-luna-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {{ form.sending ? 'Sending…' : 'Send to support' }}
          </button>
          <p class="text-[11px] text-muted-foreground leading-relaxed">
            This reaches the CarerPoint team. To speak to the care agency about a visit, use
            <NuxtLink to="/messages" class="text-luna-500 hover:underline" @click="isOpen = false">Messages</NuxtLink>.
          </p>
        </form>

        <!-- The thread -->
        <template v-else>
          <div ref="scroller" class="flex-1 overflow-y-auto min-h-0">
            <div class="p-4 space-y-3">
              <div
                v-for="msg in thread.messages"
                :key="msg.id"
                class="flex gap-2"
                :class="msg.senderType === 'visitor' ? 'justify-end' : 'justify-start'"
              >
                <div
                  v-if="msg.senderType !== 'visitor'"
                  class="w-7 h-7 rounded-full bg-lime-100 dark:bg-lime-900/40 flex items-center justify-center shrink-0 mt-0.5"
                >
                  <LucideHeadset class="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
                </div>
                <div class="max-w-[78%] min-w-0">
                  <p v-if="msg.senderType !== 'visitor'" class="text-[10px] font-medium text-muted-foreground mb-0.5 px-1">
                    {{ msg.senderName || 'CarerPoint Support' }}
                  </p>
                  <div
                    class="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
                    :class="msg.senderType === 'visitor'
                      ? 'bg-luna-500 text-white rounded-2xl rounded-br-md'
                      : 'bg-muted/60 dark:bg-muted text-foreground rounded-2xl rounded-bl-md'
                    "
                  >{{ msg.message }}</div>
                </div>
              </div>
              <p v-if="thread.error" class="text-xs text-red-600 dark:text-red-400 text-center">{{ thread.error }}</p>
            </div>
          </div>

          <div class="border-t border-border p-3 shrink-0">
            <form class="flex items-center gap-2" @submit.prevent="send">
              <input
                v-model="thread.input"
                type="text"
                placeholder="Reply…"
                :disabled="thread.sending"
                class="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-luna-500/30 focus:border-luna-500 transition-colors"
              >
              <button
                type="submit"
                :disabled="!thread.input.trim() || thread.sending"
                aria-label="Send"
                class="w-10 h-10 rounded-xl bg-luna-500 hover:bg-luna-600 text-white disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
              >
                <LucideSendHorizontal class="w-4 h-4" />
              </button>
            </form>
          </div>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  MessageCircle as LucideMessageCircle,
  ChevronDown as LucideChevronDown,
  SendHorizontal as LucideSendHorizontal,
  Headset as LucideHeadset,
} from 'lucide-vue-next'
import { normalizePortalError, usePortalAuth } from '~/composables/usePortalAuth'

/**
 * Support for family members.
 *
 * Deliberately built on the PUBLIC support conversation API rather than the
 * in-app one. A family member holds a portal access link, not a login: they
 * have no tenant, no user row and no permissions, so `/support/conversation`
 * would 401 every time. `/support/web/*` is exactly the shape that fits —
 * identified by an email and an unguessable per-thread token — and it puts them
 * on the same operator queue as everyone else instead of a side channel nobody
 * watches.
 *
 * Distinct from `/messages`, which talks to the CARE AGENCY about visits. This
 * one reaches CarerPoint about the software, and the form says so, because
 * sending "mum seemed unwell today" to a product desk helps nobody.
 */

interface ThreadMessage {
  id: string
  senderType: 'visitor' | 'ai' | 'admin' | 'operator' | 'carer'
  senderName?: string | null
  message: string
  createdAt: string
}

const STORAGE_KEY = 'carerpoint_portal_support_thread'
/** No socket for a token-authenticated visitor, so the thread polls while open. */
const POLL_MS = 15_000

const config = useRuntimeConfig()
const apiBase = String(config.public.apiUrl || '').replace(/\/+$/, '')

const isOpen = ref(false)
const unread = ref(0)
const scroller = ref<HTMLElement | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const form = reactive({ email: '', message: '', sending: false, error: '' })
const thread = reactive({
  token: '',
  messages: [] as ThreadMessage[],
  input: '',
  sending: false,
  error: '',
})

const formValid = computed(
  () => form.email.trim().includes('@') && form.message.trim().length >= 5,
)

const { portalData } = usePortalAuth()
/** Name the family member is already known by, so we don't ask twice. */
const memberName = computed(() => portalData.value?.familyMember?.name || '')

function scrollToBottom() {
  nextTick(() => {
    if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
  })
}

function persist() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: thread.token }))
  } catch {
    // Private mode — the thread just does not survive a reload.
  }
}

function open() {
  isOpen.value = true
  unread.value = 0
  if (thread.token) void refresh()
}

async function start() {
  if (!formValid.value || form.sending) return
  form.sending = true
  form.error = ''
  try {
    const res = await $fetch<{ data?: { accessToken?: string } }>(
      `${apiBase}/api/v1/support/web/conversations`,
      {
        method: 'POST',
        body: {
          name: memberName.value || undefined,
          email: form.email.trim(),
          message: form.message.trim(),
        },
      },
    )
    thread.token = res?.data?.accessToken || ''
    if (!thread.token) throw new Error('No conversation token returned')
    form.message = ''
    persist()
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: unknown } }
    form.error = normalizePortalError(e?.data?.message) || "Couldn't reach support. Please try again."
  } finally {
    form.sending = false
  }
}

async function refresh() {
  if (!thread.token) return
  try {
    const res = await $fetch<{ data?: { messages?: ThreadMessage[] } }>(
      `${apiBase}/api/v1/support/web/conversations/${thread.token}`,
    )
    const incoming = res?.data?.messages ?? []
    const grew = incoming.length > thread.messages.length
    thread.messages = incoming
    thread.error = ''
    if (grew) {
      if (!isOpen.value) unread.value += 1
      scrollToBottom()
    }
  } catch (err: unknown) {
    // A token that no longer resolves means the conversation is gone. Keeping
    // it would leave them typing into a thread that does not exist.
    const status = (err as { status?: number; statusCode?: number })
    if (status?.status === 404 || status?.statusCode === 404) {
      thread.token = ''
      thread.messages = []
      if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
    }
  }
}

async function send() {
  const text = thread.input.trim()
  if (!text || !thread.token || thread.sending) return
  thread.input = ''
  thread.sending = true
  thread.error = ''
  try {
    const res = await $fetch<{ data?: { messages?: ThreadMessage[] } }>(
      `${apiBase}/api/v1/support/web/conversations/${thread.token}/messages`,
      { method: 'POST', body: { message: text } },
    )
    thread.messages = res?.data?.messages ?? thread.messages
    scrollToBottom()
  } catch (err: unknown) {
    // Hand the text back rather than losing what they typed.
    thread.input = text
    const e = err as { data?: { message?: unknown } }
    thread.error = normalizePortalError(e?.data?.message) || "Couldn't send that. Please try again."
  } finally {
    thread.sending = false
  }
}

onMounted(() => {
  if (!import.meta.client) return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      thread.token = JSON.parse(stored)?.token || ''
      if (thread.token) void refresh()
    }
  } catch {
    // Corrupt entry — start fresh rather than blocking the widget.
  }
})

// Poll only while open on a live thread; an idle tab does not need a request
// every fifteen seconds for as long as it stays open.
watch(
  () => [isOpen.value, thread.token] as const,
  ([open_, token]) => {
    if (open_ && token && !pollTimer) {
      pollTimer = setInterval(() => void refresh(), POLL_MS)
    } else if ((!open_ || !token) && pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  },
)

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
})
</script>

<style scoped>
.support-header {
  background: linear-gradient(135deg, var(--color-luna-500, #1e5cab) 0%, var(--color-luna-700, #154283) 50%, var(--color-luna-900, #0d2854) 100%);
}

.chat-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-slide-leave-active {
  transition: all 0.2s ease-in;
}
.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

.fab-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fab-leave-active {
  transition: all 0.15s ease-in;
}
.fab-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
.fab-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
