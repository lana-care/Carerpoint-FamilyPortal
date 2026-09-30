/**
 * Client-side safety net for the realtime thread.
 *
 * The server only pushes a message to the relatives it is visible to, so this
 * should never fire. It exists so that if a message written by ANOTHER relative
 * ever reached this browser (a server regression, a stale deploy), the portal
 * would not merge it into the thread. Defence in depth, not the access control.
 */
export interface PortalMessageAuthorship {
  direction?: string | null
  family_portal_member_id?: string | null
  family_link_id?: string | null
}

/** True when `row` is a family -> agency post written by someone other than `myLinkId`. */
export function isForeignInboundMessage(
  row: PortalMessageAuthorship | null | undefined,
  myLinkId: string | null | undefined,
): boolean {
  if (!row || !myLinkId) return false
  if (row.direction !== 'inbound') return false
  const author = row.family_portal_member_id || row.family_link_id
  return Boolean(author) && String(author) !== String(myLinkId)
}
