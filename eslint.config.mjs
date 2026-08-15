// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['**/*.vue'],
    rules: {
      // eslint-plugin-vue concatenates every <script> block of an SFC into a
      // single program, so imports in a `<script setup>` that follows a plain
      // `<script>` always look "not first". The autofix then moves the
      // </script> boundary and drags `export const` into `<script setup>`,
      // where exports are a syntax error (TS1184). Unfixable and unsound here.
      'import/first': 'off',

      // Props are declared with `defineProps<{ … }>()`, so `foo?: T` already
      // states — and type-checks — that the prop may be undefined. Inventing a
      // default for every optional prop would change behaviour rather than
      // document it.
      'vue/require-default-prop': 'off',
    },
  },
)
