// src/extensions/components/Footer.ts

import { SPHttpClient } from '@microsoft/sp-http';
import styles from '../Extension.module.scss';
import { IFooterLink } from '../services/FooterService';

export class Footer {
  constructor(webUrl: string, spHttpClient: SPHttpClient) {
    // Parameters intentionally unused — we get data via render()
  }

  public async render(hostId: string, allLinks: IFooterLink[]): Promise<void> {
    if (document.getElementById(hostId)) return;

    const { main, social } = allLinks.reduce(
      (acc, link) => {
        if (link.TIRIconURL.trim() !== '') {
          acc.social.push(link);
        } else {
          acc.main.push(link);
        }
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
          <span>Made with ❤️ by DHRE Technology Team</span>
          
          <div class="${styles.TIRFooterBottomCenter}"></div>

          ${social.length > 0
            ? `<div class="${styles.TIRSocials}">
                ${social
                  .map(
                    (s) => `
                  <a href="${s.URL}" target="_blank" rel="noopener noreferrer" class="${styles.TIRSocialLink}" title="${s.Title}">
                    <img src="${s.TIRIconURL}" alt="${s.Title}" class="${styles.TIRFooterIcon}" />
                  </a>`
                  )
                  .join('')}
              </div>`
            : ''
          }
        </div>
      </footer>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = footerHtml;

    const ootbFooter =
      document.querySelector('.simpleFooterContainer') ||
      document.querySelector('[data-automationid="SimpleFooter"]') ||
      document.querySelector('[data-feature-tag*="SiteFooter"]') ||
      document.querySelector('footer.p_HGBX5_1x34n');

    if (ootbFooter && ootbFooter.parentElement) {
      ootbFooter.parentElement.replaceChild(host, ootbFooter);
    } else {
      const mount =
        (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
        (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
        document.body;
      mount.appendChild(host);
    }
  }

  public dispose(): void {
    document.querySelector(`.${styles.TIRFooter}`)?.remove();
  }
}