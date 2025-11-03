// src/extensions/extensions/components/FloatingNav.ts
import styles from '../Extension.module.scss';

export interface INavItem { id: string; label: string; icon: string; url: string; }

export class FloatingNav {
  public render(hostId: string, items: INavItem[]): void {
    if (document.getElementById(hostId)) return;

    const html = `
      <nav class="${styles.TIRFloatingNav}" role="navigation" aria-label="Primary">
        <div class="${styles.TIRButtonGroup}">
          ${items.map(i => `
            <a class="${styles.TIRNavItem}" href="${i.url}">
              <img src="${i.icon}" class="${styles.TIRNavIcon}" alt="${i.label}" />
              <span class="${styles.TIRNavLabel}">${i.label}</span>
            </a>
          `).join('')}
        </div>
      </nav>`;

    const host = document.createElement('div');
    host.id = hostId;
    host.innerHTML = html;
    document.body.appendChild(host);
  }

  public dispose(): void {
    document.querySelector(`.${styles.TIRFloatingNav}`)?.parentElement?.remove();
  }
}
