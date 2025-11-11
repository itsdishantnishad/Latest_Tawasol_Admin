// Central IDs, URL paths, and helpers for environment-agnostic links.

export const IDS = {
  hosts: {
    header: 'tir-header-host',
    nav: 'tir-nav-host',
    footer: 'tir-footer-host',
    suggest: 'tir-suggest-host',
    notif: 'tir-notif-host'
  },
  elems: {
    brand: 'tir-brand',
    search: 'tir-search',
    bell: 'tir-bell'
  }
} as const;

/**
 * Keep ONLY site-relative paths here. We resolve them with the current web/base URL.
 * If you rename pages later (before ".aspx"), change them here once.
 */
export const URL_PATHS = {
  home:      '/',                         // resolves to current web’s root
  feed:      '/SitePages/Feed.aspx',
  tasks:     '/SitePages/Tasks.aspx',
  offers:    '/SitePages/Offers.aspx',
  docs:      '/SitePages/PoliciesandProcedures.aspx',
  news:      '/SitePages/NewsView.aspx',
  trainings: '/SitePages/EventAndTraining.aspx',
  events:    '/SitePages/EventAndTraining.aspx',
  aboutDHRE: '/SitePages/About-DHRE.aspx'
} as const;

export type ResolvedUrls = {
  home: string;
  feed: string;
  tasks: string;
  offers: string;
  docs: string;
  news: string;
  trainings: string;
  events: string;
  aboutDHRE: string;
};

/** Join base + path without double slashes (ES5-safe, no startsWith). */
function joinUrl(base: string, path: string): string {
  if (!path) return base;
  const b = base.replace(/\/+$/, '');               // trim trailing slashes
  const needsSlash = path.length > 0 && path.charAt(0) !== '/';
  return b + (needsSlash ? '/' : '') + path;
}

/**
 * Resolve all paths against a base web URL (e.g., context.pageContext.web.absoluteUrl).
 * Example: resolveUrls('https://contoso.sharepoint.com/sites/MySite')
 */
export function resolveUrls(baseWebUrl: string): ResolvedUrls {
  const root = baseWebUrl.replace(/\/+$/, '');
  return {
    home:      baseWebUrl,
    feed:      joinUrl(root, URL_PATHS.feed),
    tasks:     joinUrl(root, URL_PATHS.tasks),
    offers:    joinUrl(root, URL_PATHS.offers),
    docs:      joinUrl(root, URL_PATHS.docs),
    news:      joinUrl(root, URL_PATHS.news),
    trainings: joinUrl(root, URL_PATHS.trainings),
    events:    joinUrl(root, URL_PATHS.events),
    aboutDHRE: joinUrl(root, URL_PATHS.aboutDHRE)
  };
}

/** Notifications (unchanged) */
export type NotifKind = 'party' | 'info' | 'alert' | 'megaphone' | 'check';
export interface INotif {
  id: string;
  kind: NotifKind;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  section: 'today' | 'yesterday';
}

export const HARD_NOTIFS: INotif[] = [
  { id:'1', kind:'party',     title:'Wishing Mike Thompson a Wonderful Birthday', text:`Today, we celebrate Mike Thompson's birthday. Let's make his day bright with warm wishes and a slice of ca...`, time:'10:30 AM', unread:true,  section:'today' },
  { id:'2', kind:'info',      title:'New Health Benefits Package Launch',         text:'We’re excited to announce an update to our health benefits package.',                                 time:'11:00 AM', unread:true,  section:'today' },
  { id:'3', kind:'alert',     title:'Network Outage',                              text:'We are experiencing a network outage affecting several departments. Our IT team is working to resolve the iss...', time:'11:15 PM', unread:false, section:'yesterday' },
  { id:'4', kind:'megaphone', title:'Lets welcome our New Joiner',                 text:'We are excited to announce that Jones Ray has joined our team as a [Job Title]. Please join us in welcoming th...', time:'12:10 PM', unread:false, section:'yesterday' },
  { id:'5', kind:'check',     title:'Success Alert!',                              text:'Project X has successfully launched; “We’ve secured a major contract with Y;” “Our team surpassed the quart...', time:'10:30 AM', unread:false, section:'yesterday' }
];
