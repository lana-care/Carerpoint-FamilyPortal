import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Icons are the vendored CarerPoint set (`~/lib/cp-icons`); Lucide must not come back. */
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(vue|ts)$/.test(entry) ? [full] : []
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
})
