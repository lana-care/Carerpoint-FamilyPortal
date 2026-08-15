const STORAGE_KEY = 'carerpoint.portal.sidebar.collapsed'
const EXPANDED_WIDTH = '15rem'
const COLLAPSED_WIDTH = '4rem'

/**
 * Sidebar state for the portal shell, feeding `--layout-sidebar-width` on the
 * layout. Same contract, same widths and now the same mobile-drawer API as the
 * dashboard's `useAppSidebar`, so the two shells line up pixel for pixel and a
 * component moves between the apps without rewiring.
 *
 * Its own storage key: a family member and a staff member are different people
 * on different devices, and sharing the key would let one app's preference
 * surprise the other if they ever share an origin.
 *
 * `collapsed` is a DESKTOP state (the 4rem rail) and `mobileOpen` a phone one.
 * They are separate because the rail does not exist below `md` — collapsing is
 * meaningless on a screen where the sidebar is a drawer that is either open or
 * closed.
 */
export function usePortalSidebar() {
  const collapsed = useState('portal-sidebar-collapsed', () => false)
  const mobileOpen = useState('portal-sidebar-mobile-open', () => false)

  const width = computed(() => (collapsed.value ? COLLAPSED_WIDTH : EXPANDED_WIDTH))

  function readPersisted() {
    if (!import.meta.client) return
    try {
      collapsed.value = localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      /* private mode */
    }
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, collapsed.value ? '1' : '0')
    } catch {
      /* private mode */
    }
  }

  function toggleCollapsed() {
    collapsed.value = !collapsed.value
    persist()
  }

  function openMobile() {
    mobileOpen.value = true
  }

  function closeMobile() {
    mobileOpen.value = false
  }

  function toggleMobile() {
    mobileOpen.value = !mobileOpen.value
  }

  return {
    collapsed,
    mobileOpen,
    width,
    EXPANDED_WIDTH,
    COLLAPSED_WIDTH,
    readPersisted,
    toggleCollapsed,
    openMobile,
    closeMobile,
    toggleMobile,
  }
}
