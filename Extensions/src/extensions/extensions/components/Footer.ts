// src/extensions/extensions/components/Footer.ts

import { SPHttpClient } from '@microsoft/sp-http';
import styles from '../Extension.module.scss';
import { IFooterLink } from '../services/FooterService';

export class Footer {
  constructor(webUrl: string, spHttpClient: SPHttpClient) {
    // Parameters intentionally unused — we get data via render()
  }

  public async render(hostId: string, allLinks: IFooterLink[]): Promise<void> {
    const { main, social } = allLinks.reduce(
      (acc, link) => {
        if ((link.TIRIconURL || '').trim() !== '') acc.social.push(link);
        else acc.main.push(link);
        return acc;
      },
      { main: [] as IFooterLink[], social: [] as IFooterLink[] }
    );

    const footerHtml = `
      <footer class="${styles.TIRFooter}">
        <h2 class="${styles.TIRFooterLogo}">Tawasol</h2>

        <nav class="${styles.TIRFooterNav}">
          ${main
            .map(
              (l) => `
            <a href="${l.URL}" class="${styles.TIRFooterLink}">
              ${l.Title}
            </a>`
            )
            .join('')}
        </nav>

        <hr class="${styles.TIRFooterLine}" />

        <div class="${styles.TIRFooterBottom}">
          <div class="${styles.TIRFooterBottomCenter}"></div>

          ${
            social.length > 0
              ? `<div class="${styles.TIRSocials}">
                  ${social
                    .map(
                      (s) => `
                    <a href="${s.URL}" target="_blank" rel="noopener noreferrer"
                       class="${styles.TIRSocialLink}" title="${s.Title}">
                      <img src="${s.TIRIconURL}" alt="${s.Title}" class="${styles.TIRFooterIcon}" />
                    </a>`
                    )
                    .join('')}
                </div>`
              : ''
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

    // In modern pages, comments/footer regions can load after initial render.
    // Run placement again a bit later to “snap” it correctly.
    window.setTimeout(() => this.placeFooter(host!), 800);
    window.setTimeout(() => this.placeFooter(host!), 2000);
  }

  private placeFooter(host: HTMLElement): void {
    // Always detach first to avoid duplicates / wrong position
    if (host.parentElement) host.parentElement.removeChild(host);

    // 1) Best: replace the actual Page SiteFooter region (it’s after comments)
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

    // 2) Next best: insert AFTER comments wrapper (footer should be below comments)
    const cw = document.getElementById('CommentsWrapper') as HTMLElement | null;
    if (cw) {
      // Use the parent wrapper block (usually contains the spacing/line)
      const wrapper = (cw.parentElement?.parentElement as HTMLElement) || (cw.parentElement as HTMLElement) || cw;
      const parent = wrapper.parentElement;

      if (parent) {
        if (wrapper.nextSibling) parent.insertBefore(host, wrapper.nextSibling);
        else parent.appendChild(host);
        return;
      }
    }

    // 3) Fallback: append to page canvas / chrome
    const mount =
      (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
      (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
      document.body;

    mount.appendChild(host);
  }

  public dispose(): void {
    // remove host by id (safer)
    // also remove footer element if left behind
    const host = document.getElementById('tir-footer-host');
    if (host) host.remove();

    document.querySelector(`.${styles.TIRFooter}`)?.remove();
  }
}
