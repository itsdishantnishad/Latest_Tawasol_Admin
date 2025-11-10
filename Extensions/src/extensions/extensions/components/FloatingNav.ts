import styles from '../Extension.module.scss';

export interface INavItem { id: string; label: string; icon: string; url: string; }

export class FloatingNav {
  public render(hostId: string, items: INavItem[]): void {
    if (document.getElementById(hostId)) return;
    if (!items || !items.length) return; // no items => no UI

    const html = `
      <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
        <div class="${styles.TIRButtonGroup}">
          ${items.map(i => `
            <a class="${styles.TIRNavItem}" href="${i.url}">
              ${i.icon ? `<img src="${i.icon}" class="${styles.TIRNavIcon}" alt="" aria-hidden="true" />` : ''}
              <span class="${styles.TIRNavLabel}">${i.label}</span>
            </a>
          `).join('')}
        </div>
      </nav>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = html;

    // mount inside modern canvas if present (avoids extra scroll host)
    const mount =
      (document.querySelector('#spPageCanvasContent') as HTMLElement) ||
      (document.querySelector('#spPageChromeAppDiv') as HTMLElement) ||
      document.body;
    mount.appendChild(host);
  }

  public dispose(): void {
    document.querySelector(`.${styles.TIRFloatingNav}`)?.parentElement?.remove();
  }
}
