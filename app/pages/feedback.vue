<template>
  <div class="min-h-screen bg-background pb-12">
    <header class="border-b px-4 py-3 flex items-center gap-3 sticky top-0 bg-background/95 z-10">
      <NuxtLink to="/" class="text-sm text-primary">← Home</NuxtLink>
      <h1 class="text-sm font-semibold">Feedback</h1>
    </header>
    <div class="max-w-md mx-auto px-4 py-8 space-y-6">
      <p class="text-sm text-muted-foreground text-center">
        Share a compliment, concern, or feedback about care. Max 5 fields per step.
      </p>

      <!-- Step 1: category + rating (2 fields) -->
      <div v-if="step === 1" class="space-y-4">
        <div>
          <label class="text-xs font-medium">Category</label>
          <Select v-model="category">
            <SelectTrigger class="mt-1 w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visit_feedback">Visit feedback</SelectItem>
              <SelectItem value="compliment">Compliment</SelectItem>
              <SelectItem value="complaint">Complaint</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label class="text-xs font-medium">Rating (1–5)</label>
          <Input v-model.number="rating" type="number" min="1" max="5" class="mt-1" />
        </div>
        <Button class="w-full" @click="step = 2">Next</Button>
      </div>

      <!-- Step 2: message + contact preference (2 fields) -->
      <div v-else class="space-y-4">
        <div>
          <label class="text-xs font-medium">Your message</label>
          <Textarea
            v-model="message"
            rows="5"
            class="mt-1"
            placeholder="Tell us more…"
          />
        </div>
        <div>
          <label class="text-xs font-medium">Contact preference</label>
          <Select v-model="contactPreference">
            <SelectTrigger class="mt-1 w-full">
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="none">No follow-up needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="step = 1">Back</Button>
          <Button class="flex-1" :disabled="submitting || !message.trim()" @click="submit">Submit</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { toast } from 'vue-sonner'

definePageMeta({ layout: false })

const step = ref(1)
const category = ref('visit_feedback')
const rating = ref(5)
const message = ref('')
const contactPreference = ref('email')
const submitting = ref(false)

const { token } = usePortalAuth()
const config = useRuntimeConfig()

async function submit() {
  if (!token.value) {
    toast.error('Not signed in')
    return
  }
  submitting.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    await $fetch(`${base}/api/v1/auth/family-portal/feedback`, {
      method: 'POST',
      body: {
        token: token.value,
        category: category.value,
        rating: rating.value,
        message: message.value.trim(),
        contactPreference: contactPreference.value,
      },
    })
    toast.success('Thank you — your feedback was submitted.')
    message.value = ''
    step.value = 1
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    toast.error(err?.data?.message || err?.message || 'Failed to submit')
  } finally {
    submitting.value = false
  }
}
</script>
