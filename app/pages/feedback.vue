<template>
  <div class="relative pb-12">
    <div class="max-w-md mx-auto px-4 py-8 space-y-6">
      <p class="text-sm text-muted-foreground text-center">
        Share a compliment, concern, or feedback about care.
      </p>

      <Card v-if="done">
        <CardContent class="pt-8 pb-8 text-center space-y-3">
          <p class="text-base font-semibold">Thank you</p>
          <p class="text-sm text-muted-foreground">
            Your feedback was submitted to the care agency.
          </p>
          <Button class="min-h-10" @click="resetForm">Send more feedback</Button>
        </CardContent>
      </Card>

      <Card v-else>
        <CardContent class="pt-6">
          <div v-if="step === 1" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium">Category</label>
              <Select v-model="category">
                <SelectTrigger class="w-full min-h-10">
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
            <div class="space-y-2">
              <label class="text-xs font-medium">Rating</label>
              <SegmentedControl
                v-model="ratingStr"
                :options="ratingOptions"
                size="sm"
                shape="square"
                class="w-full"
                aria-label="Rating from 1 to 5"
              />
            </div>
            <Button class="w-full min-h-10" @click="step = 2">Next</Button>
          </div>

          <div v-else class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-medium">Your message</label>
              <Textarea
                v-model="message"
                rows="5"
                placeholder="Tell us more…"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium">Contact preference</label>
              <Select v-model="contactPreference">
                <SelectTrigger class="w-full min-h-10">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="none">No follow-up needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex gap-2 pt-1">
              <Button variant="outline" class="flex-1 min-h-10" @click="step = 1">Back</Button>
              <Button class="flex-1 min-h-10" :disabled="submitting || !message.trim()" @click="submit">
                {{ submitting ? 'Submitting…' : 'Submit' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Textarea } from '~/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { toast } from 'vue-sonner'

definePageMeta({ title: 'Feedback' })

const step = ref(1)
const done = ref(false)
const category = ref('visit_feedback')
const ratingStr = ref('5')
const message = ref('')
const contactPreference = ref('email')
const submitting = ref(false)

const ratingOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
]

const { token } = usePortalAuth()
const config = useRuntimeConfig()

function resetForm() {
  done.value = false
  step.value = 1
  message.value = ''
  ratingStr.value = '5'
  category.value = 'visit_feedback'
}

async function submit() {
  if (!token.value) {
    toast.error('Not signed in')
    return
  }
  const rating = Math.min(5, Math.max(1, Number(ratingStr.value) || 5))
  submitting.value = true
  try {
    const base = String(config.public.apiUrl || '').replace(/\/+$/, '')
    const res = await $fetch<{ success?: boolean; error?: string }>(
      `${base}/api/v1/auth/family-portal/feedback`,
      {
        method: 'POST',
        // Authorization header, like every other portal call. This route used to
        // be the one exception, taking the token in the body.
        headers: { Authorization: `Bearer ${token.value}` },
        body: {
          category: category.value,
          rating,
          message: message.value.trim(),
          contactPreference: contactPreference.value,
        },
      },
    )
    if (!res?.success) {
      toast.error(res?.error || 'Failed to submit')
      return
    }
    done.value = true
  } catch (e: unknown) {
    const err = e as { data?: { message?: unknown }; message?: string }
    toast.error(normalizePortalError(err?.data?.message) || err?.message || 'Failed to submit')
  } finally {
    submitting.value = false
  }
}
</script>
