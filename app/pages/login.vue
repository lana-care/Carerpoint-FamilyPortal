<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary/10 via-background to-background">
    <div class="w-full max-w-md">
      <GlassCard radius="2xl" padding="lg" glow="luna" class="space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <LucideHeart class="w-6 h-6 text-primary" />
          </div>
          <h1 class="text-xl font-bold">Family Portal</h1>
          <p class="text-sm text-muted-foreground">Paste the access token from your invitation email.</p>
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-xs font-medium text-muted-foreground">Access token</label>
            <Input v-model="pasteToken" class="mt-1 font-mono text-sm" placeholder="token…" />
          </div>
          <Button class="w-full rounded-full" :disabled="!pasteToken?.trim()" @click="submit">Continue</Button>
        </div>
        <p v-if="err" class="text-sm text-destructive text-center">{{ err }}</p>
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

const { setToken, fetchPortal } = usePortalAuth()

onMounted(() => {
  const q = route.query.token as string | undefined
  if (q) {
    pasteToken.value = q
  }
})

async function submit() {
  err.value = null
  const t = pasteToken.value.trim()
  if (!t) return
  setToken(t)
  const res = await fetchPortal(t)
  if (res?.valid) {
    const redir = (route.query.redirect as string) || '/'
    await router.push(redir)
  } else {
    err.value = res?.error || 'Invalid token'
  }
}
</script>
