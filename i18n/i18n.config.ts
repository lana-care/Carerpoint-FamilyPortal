import { brand } from '../app/config/brand'

/**
 * Brand names injected from the single source of truth (`app/config/brand.ts`)
 * so locale prose can reference them via linked messages:
 *   "@:{'brand.name'}"  ->  Carerpoint
 * Rename in app/config/brand.ts only.
 *
 * Same shape as Carerpoint-Frontend/i18n/i18n.config.ts — the two apps share
 * one localisation setup so a string moves between them unchanged.
 */
const brandMessages = { brand: { name: brand.name, ai: brand.ai } }

export default defineI18nConfig(() => ({
  fallbackLocale: 'en-GB',
  messages: {
    'en': brandMessages,
    'en-GB': brandMessages,
    'en-CA': brandMessages,
    'fr': brandMessages,
    'fr-FR': brandMessages,
    'fr-CA': brandMessages,
  },
}))
