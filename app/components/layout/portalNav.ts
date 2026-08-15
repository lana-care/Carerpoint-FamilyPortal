import {
  Home as LucideHome,
  CalendarDays as LucideCalendarDays,
  MessagesSquare as LucideMessagesSquare,
  ClipboardList as LucideClipboardList,
  Pill as LucidePill,
  FolderClosed as LucideFolderClosed,
  Star as LucideStar,
} from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * The portal's one and only navigation list.
 *
 * It lives beside the layout components — the same place the dashboard keeps
 * `clientNav.ts` / `settingsNav.ts` — rather than inside a component, because
 * three different chromes render it: the desktop rail, the expanded sidebar and
 * the mobile drawer. When they each owned a copy, the mobile header quietly
 * drifted (it dropped Home and demoted Schedule) and nobody noticed until a
 * family member could not get back to the overview on a phone.
 *
 * Labels are i18n KEYS, not text: the caller runs them through `t()`.
 */
export interface PortalNavItem {
  /** Route path; also the key, since no two entries share one. */
  to: string
  /** i18n key under `nav.` */
  labelKey: string
  icon: Component
  /** Home matches its path exactly; everything else matches its subtree. */
  exact?: boolean
}

export const PORTAL_NAV: readonly PortalNavItem[] = [
  { to: '/', labelKey: 'nav.home', icon: LucideHome, exact: true },
  { to: '/calendar', labelKey: 'nav.calendar', icon: LucideCalendarDays },
  { to: '/messages', labelKey: 'nav.messages', icon: LucideMessagesSquare },
  { to: '/care-plan', labelKey: 'nav.carePlan', icon: LucideClipboardList },
  { to: '/medications', labelKey: 'nav.medications', icon: LucidePill },
  { to: '/documents', labelKey: 'nav.documents', icon: LucideFolderClosed },
  { to: '/feedback', labelKey: 'nav.feedback', icon: LucideStar },
] as const

/** Whether `path` should light `item` up. */
export function isPortalNavActive(item: PortalNavItem, path: string): boolean {
  if (item.exact) return path === item.to
  return path === item.to || path.startsWith(`${item.to}/`)
}
