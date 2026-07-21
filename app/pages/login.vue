<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center px-4">
    <SharedShellBackground intensity="normal" />
    <div class="relative w-full max-w-md">
      <GlassCard radius="2xl" padding="lg" glow="luna" class="space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <LucideHeart class="w-6 h-6 text-primary" />
          </div>
          <h1 class="text-xl font-bold font-display">Family Portal</h1>
          <p class="text-sm text-muted-foreground">
            Your care agency emailed you an invitation with a link. Open that link and you are signed in
            automatically — or type the access code from the email below.
          </p>
        </div>
        <div class="space-y-4">
          <div>
            <label for="access-code" class="text-sm font-medium">Access code</label>
            <Input
              id="access-code"
              v-model="pasteToken"
              class="mt-1 font-mono text-sm"
              placeholder="Type or paste your access code"
              autocomplete="off"
              spellcheck="false"
              @keyup.enter="submit"
            />
            <p class="mt-1.5 text-xs text-muted-foreground">
              It is the long code at the end of the link in your invitation email.
            </p>
          </div>
          <Button class="w-full" :disabled="!pasteToken?.trim()" @click="submit">Sign in</Button>
        </div>
        <p v-if="err" class="text-sm text-destructive text-center">{{ err }}</p>
        <p class="text-xs text-muted-foreground text-center">
          Cannot find your invitation email? Contact your care agency and ask them to send it again.
        </p>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Heart as LucideHeart } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { GlassCard } from '~/components/ui/glass-card'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const pasteToken = ref('')
const err = ref<string | null>(null)
const redirectTarget = ref('/')

const { setToken, fetchPortal } = usePortalAuth()

/**
 * Only ever redirect to an in-app path. vue-router makes an external `push`
 * impractical today, but allowlisting keeps `?redirect=` from becoming an
 * open-redirect / phishing primitive. Rejects absolute URLs, protocol-relative
 * `//evil.com` and its `/\evil.com` backslash variant.
 */
function safeRedirect(target: unknown): string {
  if (typeof target !== 'string' || !target) return '/'
  if (!target.startsWith('/')) return '/'
  if (target.startsWith('//') || target.startsWith('/\\')) return '/'
  return target
}

onMounted(() => {
  const query = { ...route.query }
  redirectTarget.value = safeRedirect(query.redirect)

  const q = query.token
  if (typeof q === 'string' && q) {
    pasteToken.value = q
    // The portal token is a PHI bearer credential. Strip it from the address bar
    // straight away so it does not linger in browser history, bookmarks or a
    // shared screenshot — same scrub as `index.vue`. `redirect` is preserved.
    delete query.token
    void router.replace({ path: '/login', query })
  }
})

async function submit() {
  err.value = null
  const t = pasteToken.value.trim()
  if (!t) return
  setToken(t)
  const res = await fetchPortal(t)
  if (res?.valid) {
    await router.push(redirectTarget.value)
  } else {
    err.value =
      res?.error ||
      'We could not recognise that access code. Please check it against your invitation email, or ask your care agency to send you a new link.'
  }
}
</script>
