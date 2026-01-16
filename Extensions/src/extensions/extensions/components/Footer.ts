// src/extensions/extensions/components/Footer.ts

import { SPHttpClient } from '@microsoft/sp-http';
import styles from '../Extension.module.scss';
import { IFooterLink } from '../services/FooterService';

export class Footer {
  constructor(webUrl: string, spHttpClient: SPHttpClient) {
    // Parameters intentionally unused — we get data via render()
  }

  private escapeHtml(s: string): string {
    return (s || '').replace(/[&<>"']/g, (c) => {
      switch (c) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return c;
      }
    });
  }

  private safeUrl(raw?: string): string {
    const v = (raw || '').trim();
    if (!v) return '';
    try {
      // allow relative URLs too
      const u = new URL(v, window.location.origin);
      const p = u.protocol.toLowerCase();
      if (p === 'http:' || p === 'https:' || p === 'mailto:' || p === 'tel:') return u.href;
      return '';
    } catch {
      return '';
    }
  }

  public async render(hostId: string, allLinks: IFooterLink[]): Promise<void> {
    const buckets = allLinks.reduce(
      (acc, link) => {
        const url = (link.URL || '').trim();
        const icon = (link.TIRIconURL || '').trim();

        if (icon) {
          // social icon (only if it has a URL)
          if (url) acc.social.push(link);
          else acc.meta.push(link);
        } else if (url) {
          // main footer links
          acc.main.push(link);
        } else {
          // meta row (copyright/settings)
          acc.meta.push(link);
        }

        return acc;
      },
      { main: [] as IFooterLink[], social: [] as IFooterLink[], meta: [] as IFooterLink[] }
    );

    // copyright from meta item (Title only row)
    const year = new Date().getFullYear();
    const metaText =
      buckets.meta.find(m => {
        const t = (m.Title || '').toLowerCase();
        return t.includes('copyright') || t.includes('all rights') || t.includes('©') || t.includes('&copy;');
      })?.Title || buckets.meta[0]?.Title || `© ${year} Tawasol. All rights reserved`;

    // Optional: support {year} placeholder
    const copyrightText =
      (metaText || '').replace(/\{year\}/gi, String(year)) || `© ${year} Tawasol. All rights reserved`;

    const footerHtml = `
      <footer class="${styles.TIRFooter}">
        <h2 class="${styles.TIRFooterLogo}">Tawasol</h2>

        <nav class="${styles.TIRFooterNav}">
          ${buckets.main
            .map((l) => {
              const href = this.safeUrl(l.URL);
              if (!href) return '';
              return `
                <a href="${href}" class="${styles.TIRFooterLink}">
                  ${this.escapeHtml(l.Title)}
                </a>
              `;
            })
            .join('')}
        </nav>

        <hr class="${styles.TIRFooterLine}" />

        <div class="${styles.TIRFooterBottom}">
          <div class="${styles.TIRFooterBottomLeft}"></div>

          <div class="${styles.TIRFooterCopy}">
            ${this.escapeHtml(copyrightText)}
          </div>

          ${
            buckets.social.length > 0
              ? `<div class="${styles.TIRSocials}">
                  ${buckets.social
                    .map((s) => {
                      const href = this.safeUrl(s.URL);
                      const img = this.safeUrl(s.TIRIconURL);
                      if (!href || !img) return '';
                      return `
                        <a href="${href}" target="_blank" rel="noopener noreferrer"
                           class="${styles.TIRSocialLink}" title="${this.escapeHtml(s.Title)}">
                          <img src="${img}" alt="${this.escapeHtml(s.Title)}" class="${styles.TIRFooterIcon}" />
                        </a>
                      `;
                    })
                    .join('')}
                </div>`
              : `<div></div>`
          }
        </div>
      </footer>
    `;

    // Create OR reuse host (IMPORTANT: do not early return; we may need to MOVE it)
    let host = document.getElementById(hostId) as HTMLDivElement | null;
    if (!host) {
      host = document.createElement('div');
      host.id = hostId;
    }
    host.innerHTML = footerHtml;

    // Place footer at the real bottom (below comments if comments exist)
    this.placeFooter(host);

    window.setTimeout(() => this.placeFooter(host!), 800);
    window.setTimeout(() => this.placeFooter(host!), 2000);
  }

  private placeFooter(host: HTMLElement): void {
    if (host.parentElement) host.parentElement.removeChild(host);

    const siteFooterRegion =
      (document.querySelector('[data-viewport-id*="Page.SiteFooter"]') as HTMLElement) ||
      (document.querySelector('div[id^="vpc.Page.SiteFooter"]') as HTMLElement) ||
      (document.querySelector('[data-feature-tag*="SiteFooter"]') as HTMLElement) ||
      (document.querySelector('.simpleFooterContainer') as HTMLElement) ||
      (document.querySelector('[data-automationid="SimpleFooter"]') as HTMLElement);

    if (siteFooterRegion && siteFooterRegion.parentElement) {
      siteFooterRegion.parentElement.replaceChild(host, siteFooterRegion);
      return;
    }

    const cw = document.getElementById('CommentsWrapper') as HTMLElement | null;
    if (cw) {
      const wrapper = (cw.parentElement?.parentElement as HTMLElement) || (cw.parentElement as HTMLElement) || cw;
      const parent = wrapper.parentElement;

      if (parent) {
        if (wrapper.nextSibling) parent.insertBefore(host, wrapper.nextSibling);
        else parent.appendChild(host);
        return;
      }
    }

    const mount =
      (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
      (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
      document.body;

    mount.appendChild(host);
  }

  public dispose(): void {
    const host = document.getElementById('tir-footer-host');
    if (host) host.remove();

    document.querySelector(`.${styles.TIRFooter}`)?.remove();
  }
}
