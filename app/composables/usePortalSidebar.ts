const STORAGE_KEY = 'carerpoint.portal.sidebar.collapsed'
const EXPANDED_WIDTH = '15rem'
const COLLAPSED_WIDTH = '4rem'

/**
 * Sidebar collapse state for the portal shell, feeding `--layout-sidebar-width`
 * on the layout. Same contract and same widths as the dashboard's
 * `useAppSidebar`, so the two shells line up pixel for pixel.
 *
 * Its own storage key: a family member and a staff member are different people
 * on different devices, and sharing the key would let one app's preference
 * surprise the other if they ever share an origin.
 */
export function usePortalSidebar() {
  const collapsed = useState('portal-sidebar-collapsed', () => false)

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

  return {
    collapsed,
    width,
    EXPANDED_WIDTH,
    COLLAPSED_WIDTH,
    readPersisted,
    toggleCollapsed,
  }
}
