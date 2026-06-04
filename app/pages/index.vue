<template>
  <div class="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background">
    <header
      class="glass-bar border-b border-border/60 sticky top-0 z-10 shadow-sm"
    >
      <div class="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <LucideHeart class="w-4 h-4 text-primary" />
          </div>
          <div class="min-w-0">
            <h1 class="text-sm font-bold tracking-tight">Carerpoint Family Portal</h1>
            <p v-if="portalData?.familyMember" class="text-[10px] text-muted-foreground truncate">
              Welcome, {{ portalData.familyMember.name || 'Family Member' }}
            </p>
          </div>
        </div>
        <template v-if="portalData?.valid">
          <Separator class="hidden sm:block h-6 shrink-0" orientation="vertical" />
          <nav class="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
            <NuxtLink to="/schedule" class="text-primary hover:underline">Schedule</NuxtLink>
            <NuxtLink to="/calendar" class="text-primary hover:underline">Calendar</NuxtLink>
            <NuxtLink to="/messages" class="text-primary hover:underline">Messages</NuxtLink>
            <NuxtLink to="/care-plan" class="text-primary hover:underline">Care plan</NuxtLink>
            <NuxtLink to="/medications" class="text-primary hover:underline">Medications</NuxtLink>
            <NuxtLink to="/documents" class="text-primary hover:underline">Documents</NuxtLink>
            <NuxtLink to="/feedback" class="text-primary hover:underline">Feedback</NuxtLink>
          </nav>
        </template>
      </div>
    </header>

    <div v-if="loading" class="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <Skeleton class="h-56 w-full rounded-2xl" />
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton v-for="i in 6" :key="i" class="h-40 rounded-xl" />
      </div>
    </div>

    <div v-else-if="error" class="max-w-md mx-auto px-4 py-24 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
        <LucideShieldAlert class="w-8 h-8 text-destructive" />
      </div>
      <h2 class="text-lg font-bold mb-2">Access Denied</h2>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <NuxtLink to="/login" class="text-sm text-primary underline">Use access link</NuxtLink>
    </div>

    <div v-else-if="portalData?.valid" class="max-w-5xl mx-auto px-4 py-8 space-y-10 pb-16">
      <!-- Hero -->
      <div class="rounded-2xl border bg-card shadow-md overflow-hidden">
        <div class="bg-gradient-to-br from-primary/12 via-card to-card px-6 sm:px-8 pt-8 pb-6">
          <div class="flex flex-col sm:flex-row sm:items-start gap-6">
            <Avatar class="h-24 w-24 shrink-0 ring-4 ring-background shadow-lg">
              <AvatarFallback class="text-2xl font-bold bg-primary/20 text-primary">
                {{ clientInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1 min-w-0 space-y-3">
              <div>
                <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Care overview</p>
                <h2 class="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{{ clientName }}</h2>
                <Badge variant="secondary" class="text-[10px] mt-2">{{ String(portalData.client?.status || 'Active') }}</Badge>
              </div>
              <div
                v-if="portalData.client?.medicalConditions || portalData.client?.allergies"
                class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm pt-2 border-t border-border/60"
              >
                <div v-if="portalData.client?.medicalConditions">
                  <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Medical conditions</p>
                  <p class="mt-1 leading-snug">{{ formatList(portalData.client.medicalConditions) }}</p>
                </div>
                <div v-if="portalData.client?.allergies">
                  <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Allergies</p>
                  <p class="mt-1 leading-snug">{{ formatList(portalData.client.allergies) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="portalData.carePlan" class="px-6 sm:px-8 py-5 border-t bg-muted/15">
          <div class="flex items-start gap-3">
            <LucideClipboardList class="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-semibold text-foreground">Active care plan</p>
              <p class="text-sm font-medium mt-0.5">{{ (portalData.carePlan as { title?: string }).title }}</p>
              <p v-if="(portalData.carePlan as { summary?: string }).summary" class="text-sm text-muted-foreground mt-1">
                {{ (portalData.carePlan as { summary?: string }).summary }}
              </p>
              <NuxtLink to="/care-plan" class="text-xs text-primary font-medium inline-block mt-2 hover:underline">
                View full care plan
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs default-value="overview" class="w-full">
        <TabsList class="grid w-full max-w-md grid-cols-2 h-11">
          <TabsTrigger value="overview" class="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="updates" class="text-sm">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="mt-8 space-y-8">
          <div class="grid lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
              <h3 class="text-sm font-semibold text-foreground">Quick links</h3>
              <div class="grid sm:grid-cols-2 gap-4">
                <NuxtLink
                  v-for="link in quickLinks"
                  :key="link.to"
                  :to="link.to"
                  class="group glass-card hairline-border rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div class="flex items-start gap-4">
                    <div
                      class="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary group-hover:bg-primary/15"
                    >
                      <component :is="link.icon" class="w-5 h-5" />
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-foreground group-hover:text-primary transition-colors">{{ link.label }}</p>
                      <p class="text-xs text-muted-foreground mt-1 leading-snug">{{ link.hint }}</p>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-foreground">This month</h3>
              <CalendarMonth :year="calendarYear" :month="calendarMonth" :marked-days="markedVisitDays" />
              <NuxtLink
                to="/calendar"
                class="text-xs text-primary font-medium inline-flex items-center gap-1 hover:underline"
              >
                Open full calendar
                <LucideChevronRight class="w-3 h-3" />
              </NuxtLink>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="updates" class="mt-8 space-y-8">
          <Card>
            <CardHeader class="pb-2 flex flex-row items-center justify-between">
              <CardTitle class="text-base font-semibold flex items-center gap-2">
                <LucideCalendar class="w-5 h-5 text-primary" />
                Recent visits
              </CardTitle>
              <NuxtLink to="/schedule" class="text-xs text-primary hover:underline">View all</NuxtLink>
            </CardHeader>
            <CardContent class="pt-0">
              <div v-if="portalData.recentVisits?.length" class="space-y-2">
                <NuxtLink
                  v-for="(visit, i) in portalData.recentVisits"
                  :key="visit.id || i"
                  :to="visit.id ? `/visits/${visit.id}` : '#'"
                  class="flex items-start gap-3 p-3 rounded-xl border bg-muted/10 hover:bg-muted/30 transition-colors"
                  :class="{ 'pointer-events-none opacity-60': !visit.id }"
                >
                  <div
                    class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    :class="visit.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-muted'"
                  >
                    <LucideCheck v-if="visit.status === 'completed'" class="w-4 h-4 text-emerald-600" />
                    <LucideClock v-else class="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-sm font-medium">{{ formatDate(visit.date) }}</span>
                      <Badge
                        variant="secondary"
                        class="text-[9px]"
                        :class="{
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300':
                            visit.status === 'completed',
                        }"
                      >
                        {{ visit.status }}
                      </Badge>
                    </div>
                    <p v-if="visit.mood" class="text-xs text-muted-foreground mt-0.5">
                      Mood: {{ moodLabel(String(visit.mood)) }}
                      <span v-if="visit.foodIntake"> · Food: {{ visit.foodIntake }}</span>
                    </p>
                    <p v-if="visit.notes" class="text-xs text-muted-foreground mt-1 line-clamp-2">{{ visit.notes }}</p>
                  </div>
                </NuxtLink>
              </div>
              <p v-else class="text-sm text-muted-foreground italic py-4 text-center">No recent visits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader class="pb-2 flex flex-row items-center justify-between">
              <CardTitle class="text-base font-semibold flex items-center gap-2">
                <LucideMessageCircle class="w-5 h-5 text-primary" />
                Messages
              </CardTitle>
              <NuxtLink to="/messages" class="text-xs text-primary hover:underline">Open thread</NuxtLink>
            </CardHeader>
            <CardContent class="pt-0">
              <div v-if="portalData.messages?.length" class="space-y-2">
                <div
                  v-for="msg in portalData.messages"
                  :key="msg.id || msg.content"
                  class="p-3 rounded-xl text-sm"
                  :class="
                    msg.direction === 'outbound'
                      ? 'bg-primary/5 border-l-4 border-primary'
                      : 'bg-muted/30 border-l-4 border-muted-foreground/40'
                  "
                >
                  <p>{{ msg.content }}</p>
                  <p class="text-[10px] text-muted-foreground mt-1">{{ formatDateTime(msg.createdAt || msg.created_at || '') }}</p>
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground italic py-4 text-center">No messages yet</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <footer class="border-t mt-auto py-6 text-center text-xs text-muted-foreground">
      <p>Carerpoint · Family Portal</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  Heart as LucideHeart,
  ShieldAlert as LucideShieldAlert,
  ClipboardList as LucideClipboardList,
  Calendar as LucideCalendar,
  Check as LucideCheck,
  Clock as LucideClock,
  MessageCircle as LucideMessageCircle,
  ChevronRight as LucideChevronRight,
  CalendarDays as LucideCalendarDays,
  Pill as LucidePill,
  FileText as LucideFileText,
  MessageSquare as LucideMessageSquare,
  LayoutGrid as LucideLayoutGrid,
} from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import { Skeleton } from '~/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { CalendarMonth } from '~/components/ui/calendar'

definePageMeta({ layout: false })

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)

const { token, portalData, fetchPortal, setToken } = usePortalAuth()

const clientName = computed(() => {
  if (!portalData.value?.client) return ''
  const c = portalData.value.client as { preferredName?: string; firstName?: string; lastName?: string }
  return c.preferredName || `${c.firstName || ''} ${c.lastName || ''}`.trim()
})

const clientInitials = computed(() => {
  if (!portalData.value?.client) return '?'
  const c = portalData.value.client as { firstName?: string; lastName?: string }
  return `${(c.firstName || '').charAt(0)}${(c.lastName || '').charAt(0)}`.toUpperCase()
})

const calendarYear = computed(() => new Date().getFullYear())
const calendarMonth = computed(() => new Date().getMonth())

const markedVisitDays = computed(() => {
  const set = new Set<number>()
  const y = calendarYear.value
  const m = calendarMonth.value
  const addDay = (dateStr: string | undefined) => {
    if (!dateStr) return
    const parts = String(dateStr).split('T')[0]?.split('-').map(Number) ?? []
    const [py, pm, pd] = parts
    if (py === y && pm === m + 1 && typeof pd === 'number') set.add(pd)
  }
  for (const v of portalData.value?.recentVisits || []) addDay(v?.date)
  for (const v of portalData.value?.upcomingVisits || []) addDay(v?.date)
  return set
})

const quickLinks = computed(() => [
  { to: '/calendar', label: 'Calendar', hint: 'Month view and visit markers', icon: LucideCalendarDays },
  { to: '/messages', label: 'Messages', hint: 'Chat with the agency', icon: LucideMessageSquare },
  { to: '/care-plan', label: 'Care plan', hint: 'Read-only goals and needs', icon: LucideFileText },
  { to: '/medications', label: 'Medications', hint: 'Current medication list', icon: LucidePill },
  { to: '/schedule', label: 'Schedule', hint: 'Upcoming visits', icon: LucideCalendar },
  { to: '/documents', label: 'Documents', hint: 'Shared files', icon: LucideLayoutGrid },
])

function formatList(val: unknown) {
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'string') return val
  return ''
}

function formatDate(date: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDateTime(dt: string) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function moodLabel(mood: string) {
  const map: Record<string, string> = {
    happy: '😊 Happy',
    neutral: '😐 Neutral',
    sad: '😢 Sad',
    anxious: '😰 Anxious',
    confused: '😕 Confused',
  }
  return map[mood] || mood
}

onMounted(async () => {
  const qToken = route.query.token as string | undefined
  if (qToken) {
    setToken(qToken)
    await fetchPortal(qToken)
    await router.replace({ path: '/', query: {} })
  } else if (token.value) {
    await fetchPortal()
  } else {
    error.value = 'No access token. Open the link from your email or sign in below.'
  }

  if (portalData.value && !portalData.value.valid) {
    error.value = portalData.value.error || 'Invalid session.'
  } else if (portalData.value?.valid) {
    error.value = null
  }
  loading.value = false
})
</script>
