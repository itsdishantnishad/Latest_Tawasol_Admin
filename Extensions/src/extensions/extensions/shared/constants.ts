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

export const URLS = {
  home:  '/sites/IntranetRevampTawasol',
  feed:  '/sites/IntranetRevampTawasol/SitePages/Feed.aspx',
  tasks: '/sites/IntranetRevampTawasol/SitePages/Tasks.aspx',
  offers:'/sites/IntranetRevampTawasol/SitePages/Offers.aspx',
  docs:  '/sites/IntranetRevampTawasol/SitePages/Documents.aspx'
} as const;

/** Simple hard-coded notifications (structure kept small & clear) */
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

export const ELEMENT_IDS = {
  hosts:  { header: 'tir-header-host', nav: 'tir-nav-host', footer: 'tir-footer-host', suggest: 'tir-suggest-host', notif: 'tir-notif-host' },
  elems:  { brand: 'tir-brand', search: 'tir-search', bell: 'tir-bell' }
} as const;