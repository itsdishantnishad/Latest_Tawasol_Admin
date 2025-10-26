// src/extensions/extensions/shared/icons.ts

/** Small, crisp inline SVGs centralised here to keep components slim. */
export const Icons = {
  search: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <circle cx="11" cy="11" r="7.5" stroke="#B8B8B8" stroke-width="1.5"/>
    <path d="M16.5 16.5L21 21" stroke="#B8B8B8" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  // Notification row icons
  party: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 21l6.3-16.9a1 1 0 0 1 1.4-.6l.2.1a1 1 0 0 1 .4 1.3L5 21z"/><path d="M12 5l7 7"/><path d="M14 3l1 4"/><path d="M17 4l4 1"/>
  </svg>`,
  info: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M11 12h2v6h-2z"/>
  </svg>`,
  alert: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M10.3 3.1L1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.6 3.1a2 2 0 0 0-3.3 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
  </svg>`,
  megaphone: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 11v2"/><path d="M7 9v6"/><path d="M21 8v8l-10-3H7a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3h4z"/>
  </svg>`,
  check: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E2E2E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>
  </svg>`,
};

/** Helper to map a notification kind to its icon. */
export function getNotifIcon(kind: 'party' | 'info' | 'alert' | 'megaphone' | 'check'): string {
  return Icons[kind];
}
