
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

/* === Visuals tuned to your image ===
   - Inter 14/22
   - Back: dark text + thin left caret
   - Divider: 1px, 16px tall
   - First crumb: light grey
   - Chevron: light grey
   - Current: darker + semibold
*/
const CSS = `
.__gbc_row{display:inline-flex;align-items:center;gap:12px;height:22px}
.__gbc_back{
  display:inline-flex;align-items:center;gap:6px;background:none;border:0;padding:0;cursor:pointer;
  font-family:Inter, Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px; line-height: 24px; letter-spacing: 0; color: #000000; font-weight: 400; }
.__gbc_back svg{width:18px;height:18px;display:block}
.__gbc_divider{width:1px;height:16px;background:rgba(58,59,67,.35)}
.__gbc_wrap{
  display:inline-flex;align-items:center;gap:10px;height:22px;
  font-family:Inter, Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
  font-size:14px;line-height:22px;letter-spacing:0;color:#3A3B43;
  -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
}
.__gbc_link{color: #A7A7A7;font-weight: 400;text-decoration: none;cursor: pointer;font-size: 14px;line-height: 22px;}
.__gbc_link:hover{text-decoration:underline}
.__gbc_sep{color:#B9BCC3;opacity:1;margin:0 2px;user-select:none}
.__gbc_current{color: #3A3B43;font-weight: 500;font-size: 14px;line-height: 22px;font-family: Inter, sans-serif;}
`;

let __gbc_styles = false;
function ensureStyles(){
  if(__gbc_styles) return;
  if(typeof document!=='undefined'){
    const s=document.createElement('style');
    s.setAttribute('data-global-breadcrumbs','1');
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  }
  __gbc_styles = true;
}

export interface GlobalBreadcrumbsProps {
  sectionLabel?: string;
  currentLabel?: string;
  onBack?: () => void;
  showBack?: boolean;      // show the Back control like your screenshot
  backText?: string;       // default "Back"
  backIconSvg?: string;    // optional override
}

interface S { section:string; current:string; }

const tidy = (s:string)=> (s||'')
  .replace(/[-_]+/g,' ').replace(/\s+/g,' ').trim()
  .replace(/\b\w/g, m=>m.toUpperCase());

function detectLabels(): S {
  const path = (typeof window!=='undefined'? window.location.pathname : '').toLowerCase();
  const title = (typeof document!=='undefined'? document.title : '').trim();
  const q = (typeof window!=='undefined'? new URLSearchParams(window.location.search) : null);
  const fromTitle = () => (title.split(' - ')[0] || 'Details');
  const map: Array<{match:RegExp; sect:string; current?:string|((p:string)=>string)}>= [
    { match:/news/,            sect:'News',                 current:'News Details' },
    { match:/event/,           sect:'Events',               current:'Event Details' },
    { match:/offer/,           sect:'Home',               current:'Offer & Benefits' },
    { match:/train/,           sect:'Trainings',            current:'Training Details' },
    { match:/task/,            sect:'Task',                 current:'Task Details' },
    { match:/(policy|procedure)/, sect:'Policies & procedures',
      current:()=> tidy((q && q.get('cat')) || fromTitle() || 'Details') },
    { match:/leave/,           sect:'Home',                 current:'Leave Details' },
    { match:/hr-letters?/,     sect:'Home',                 current:'HR Letters' },
    { match: /back/,            sect:'Home',                  current:'Offer & Benefits'},
    {match:/back/,              sect:'Home',                  current:'Beverage Menu'},
  ];
  for(const r of map){
    if(r.match.test(path)){
      const cur = typeof r.current==='function' ? (r.current as any)(path) : (r.current || fromTitle());
      return { section:r.sect, current:cur as string };
    }
  }
  const bits = path.split('/').filter(Boolean);
  const last = tidy(bits[bits.length-1] || fromTitle());
  const prev = tidy(bits[bits.length-2] || 'Home');
  return { section:prev, current:last.includes('.') ? 'Details' : last };
}

/* Thin caret, like your capture */
const DEFAULT_BACK_SVG = `
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M14.25 19.25L7.75 12l6.5-7.25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export class GlobalBreadcrumbs extends React.Component<GlobalBreadcrumbsProps, S> {
  static defaultProps: Partial<GlobalBreadcrumbsProps> = { showBack: true, backText: 'Back' };

  constructor(props:GlobalBreadcrumbsProps){
    super(props);
    ensureStyles();
    const d = detectLabels();
    this.state = {
      section: props.sectionLabel || d.section,
      current: props.currentLabel || d.current,
    };
    this.goBack = this.goBack.bind(this);
  }

  private goBack(ev:React.MouseEvent){
    ev.preventDefault();
    if(this.props.onBack) this.props.onBack();
    else if(typeof window!=='undefined') window.history.back();
  }

  render(): React.ReactElement<any>{
    const { section, current } = this.state;
    const { showBack, backText='Back', backIconSvg } = this.props;

    const crumb = React.createElement(
      'nav',
      { className:'__gbc_wrap', 'aria-label':'Breadcrumb' },
      React.createElement('a', { href:'#', className:'__gbc_link', onClick:this.goBack, 'aria-label':'Go back one step' }, section),
      React.createElement('span', { className:'__gbc_sep', 'aria-hidden':'true' }, '›'),
      React.createElement('span', { className:'__gbc_current' }, current),
    );

    if(!showBack) return crumb;

    return React.createElement(
      'div',
      { className:'__gbc_row' },
      React.createElement(
        'button',
        { className:'__gbc_back', onClick:this.goBack, 'aria-label':'Back' },
        React.createElement('span', { 'aria-hidden':'true', dangerouslySetInnerHTML:{ __html: (backIconSvg || DEFAULT_BACK_SVG) } }),
        React.createElement('span', null, backText)
      ),
      React.createElement('span', { className:'__gbc_divider', 'aria-hidden':'true' }),
      crumb
    );
  }
}

export default GlobalBreadcrumbs;
