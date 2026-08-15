/**
 * Carerpoint brand config — single source of truth for product & AI names.
 *
 * Mirrors `app/config/brand.ts` in Carerpoint-Frontend, and exists for the same
 * reason: `i18n.config.ts` injects these as linked messages (`@:{'brand.name'}`)
 * so locale prose never hardcodes the product name.
 */
const name = 'Carerpoint'
const ai = 'CapoAI'

export const brand = {
  /** Product name shown in the UI. */
  name,
  /** AI assistant / engine name. */
  ai,
} as const

export type Brand = typeof brand
