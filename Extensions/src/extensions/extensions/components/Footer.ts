import styles from '../Extension.module.scss';

export interface IFooterLink { label: string; url: string; }

export class Footer {
  public render(hostId: string, links: IFooterLink[]): void {
    if (document.getElementById(hostId)) return;

    const html = `
      <footer class="${styles.TIRFooter}">
        <h2 class="${styles.TIRFooterLogo}">Tawasol</h2>
        <nav class="${styles.TIRFooterNav}">
          ${links.map(l => `<a href="${l.url}" class="${styles.TIRFooterLink}">${l.label}</a>`).join('')}
        </nav>
        <hr class="${styles.TIRFooterLine}" />
        <div class="${styles.TIRFooterBottom}">
          <span>© 2025 Tawasol. All rights reserved.</span>
          <div class="${styles.TIRFooterBottomCenter}">Made with ❤️ by DHRE Technology Team</div>
        </div>
      </footer>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = html;

    // ✅ Try replacing OOTB green footer if present
    const ootbFooter =
      document.querySelector('.simpleFooterContainer') ||
      document.querySelector('[data-automationid="SimpleFooter"]') ||
      document.querySelector('[data-feature-tag*="SiteFooter"]');

    if (ootbFooter && ootbFooter.parentElement) {
      ootbFooter.parentElement.replaceChild(host, ootbFooter);
    } else {
      // fallback if not found: append after canvas
      const canvas = document.querySelector('#spPageCanvasContent');
      (canvas?.parentElement || document.body).appendChild(host);
    }
  }

  public dispose(): void {
    document.querySelector(`.${styles.TIRFooter}`)?.remove();
  }
}
