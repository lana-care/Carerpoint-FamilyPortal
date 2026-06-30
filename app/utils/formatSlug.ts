/**
 * Convert a snake_case / SCREAMING_SNAKE_CASE / kebab-case slug into a
 * human-friendly Title Case label.
 *
 *   formatSlug('personal_care')      // → 'Personal Care'
 *   formatSlug('zero_hours')         // → 'Zero Hours'
 *   formatSlug('SELF_ADMINISTERED')  // → 'Self Administered'
 *   formatSlug('not-given')          // → 'Not Given'
 *   formatSlug('inProgress')         // → 'In Progress'
 *   formatSlug(null)                 // → ''
 */
export function formatSlug(input: string | null | undefined): string {
  if (input == null) return ''
  const s = String(input).trim()
  if (!s) return ''
  return s
    // camelCase / PascalCase → split into words
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Normalise separators to a single space
    .replace(/[_\-]+/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
