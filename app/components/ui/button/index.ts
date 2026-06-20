import { cva, type VariantProps } from 'class-variance-authority'

export { default as Button } from './Button.vue'

/** CarerPoint pill button system — aligned with Luna-Website PillButton / .btn-pill-* */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'btn-pill btn-pill-primary rounded-full',
        destructive: 'btn-pill btn-pill-destructive rounded-full',
        success: 'btn-pill btn-pill-success rounded-full',
        warning: 'btn-pill btn-pill-warning rounded-full',
        outline: 'btn-pill btn-pill-glass rounded-full',
        secondary: 'btn-pill btn-pill-glass rounded-full text-foreground',
        ghost: 'btn-pill btn-pill-ghost rounded-full',
        link: 'text-primary underline-offset-4 hover:underline font-medium h-auto p-0 rounded-none shadow-none',
      },
      size: {
        default: 'h-10 px-6',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 shrink-0 rounded-full p-0 shadow-none',
      },
    },
    compoundVariants: [
      { variant: 'ghost', size: 'icon', class: '!bg-transparent hover:bg-foreground/[0.06]' },
      { variant: 'default', size: 'icon', class: 'btn-pill-primary min-w-10' },
      { variant: 'destructive', size: 'icon', class: 'btn-pill-destructive min-w-10' },
      { variant: 'success', size: 'icon', class: 'btn-pill-success min-w-10' },
      { variant: 'warning', size: 'icon', class: 'btn-pill-warning min-w-10' },
      { variant: 'outline', size: 'icon', class: 'btn-pill-glass' },
      { variant: 'link', size: ['default', 'sm', 'lg', 'icon'], class: '!h-auto !w-auto !px-0 !py-0' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
