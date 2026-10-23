import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Icons are the CarerPoint set (`@lana-care/icons`); Lucide must not come back. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const walk = (dir: string, ext = /\.(vue|ts)$/): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full, ext)
    return ext.test(entry) ? [full] : []
  })

describe('icon library', () => {
  it('app source never imports lucide-vue-next', () => {
    const offenders = walk(join(root, 'app'))
      .filter((f) => readFileSync(f, 'utf8').includes('lucide-vue-next'))
      .map((f) => relative(root, f))
    expect(offenders).toEqual([])
  })

  it('package.json depends on no Lucide package', () => {
    expect(readFileSync(join(root, 'package.json'), 'utf8')).not.toMatch(/lucide/i)
  })

  it('loads @lana-care/icons/icons.css exactly once', () => {
    // @lana-care/ui/style.css imports icons.css too, so loading it would be a second copy.
    const css = walk(join(root, 'app'), /\.(css|vue|ts)$/).map((f) => readFileSync(f, 'utf8')).join('\n')
    expect(css.match(/@lana-care\/icons\/icons\.css/g)).toHaveLength(1)
    expect(css).not.toMatch(/@lana-care\/ui\/style\.css/)
  })
})
