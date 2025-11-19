import * as React from 'react';
import styles from './OffersBenefits.module.scss';
import { PayloadModel, AnyCard } from './types';
import { fetchJson, readPlaceholder } from './Api';

export interface IOffersBenefitsProps {
  mode: 'placeholder' | 'api';
  api: { baseUrl: string; medicalPath: string; privilegesPath: string };
  placeholders: { medical: string; privileges: string };
  cacheMinutes: number;
  maxItems: number;

  sectionTitleMedical: string;
  
  sectionTitlePrivileges: string;

  /** Optional: builds the "Home" link in breadcrumb */
  homeUrl?: string;
}

interface State {
  loading: boolean;
  activeTab: 'medical' | 'privileges';
  payload?: PayloadModel;
  error?: string;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ─────────────────────────────
   Minimal in-file Breadcrumb
   ───────────────────────────── */
const Breadcrumb: React.FC<{ homeUrl?: string }> = ({ homeUrl }) => {
  const goBack = () => window.history.back();
  const url = homeUrl || '/';

  return (
    <div className={styles.breadcrumb}>
      <button type="button" className={styles.backBtn} onClick={goBack}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M12.5 15L7.5 10L12.5 5" stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Back</span>
      </button>

      <div className={styles.breadDivider} />

      <div className={styles.linksContainer}>
        <a className={styles.crumbLink} href={url}>Home</a>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M6 12L10 8L6 4" stroke="#9ba3ae" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={styles.crumbCurrent}>Offers &amp; Benefits</span>
      </div>
    </div>
  );
};

export default class OffersBenefits extends React.Component<IOffersBenefitsProps, State> {
  private abort?: AbortController;
  state: State = { loading: true, activeTab: 'medical' };

  componentDidMount() { this.load(this.state.activeTab); }
  componentWillUnmount() { this.abort?.abort(); }

  private cacheKey(tab: 'medical' | 'privileges') {
    const { mode, api, placeholders, maxItems } = this.props;
    return `ob:v12:${mode}:${tab}:${api.baseUrl}:${api.medicalPath}:${api.privilegesPath}:${placeholders[tab].length}:${maxItems}`;
  }

  private async load(tab: 'medical' | 'privileges') {
    try {
      this.setState({ loading: true, activeTab: tab, error: undefined });

      const key = this.cacheKey(tab);
      const ttl = this.props.cacheMinutes * 60 * 1000;
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const { t, data } = JSON.parse(cached);
        if (Date.now() - t < ttl) { this.setState({ payload: data, loading: false }); return; }
      }

      let data: PayloadModel;
      if (this.props.mode === 'placeholder') {
        data = readPlaceholder(tab === 'medical' ? this.props.placeholders.medical : this.props.placeholders.privileges);
      } else {
        this.abort?.abort(); this.abort = new AbortController();
        const url = this.props.api.baseUrl + (tab === 'medical' ? this.props.api.medicalPath : this.props.api.privilegesPath);
        data = await fetchJson(url, this.abort.signal);
      }

      if (Array.isArray((data as any).cards) && this.props.maxItems > 0) {
        (data as any).cards = (data as any).cards.slice(0, this.props.maxItems);
      }

      sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
      this.setState({ payload: data, loading: false });
    } catch (e: any) {
      this.setState({ error: e?.message || 'Failed to load', loading: false });
    }
  }

  private privItems: [string, string, string, string] =
    [styles.item0, styles.item1, styles.item2, styles.item3];

  /* ---------- PRIVILEGES ---------- */
  private renderPrivCard(card: AnyCard, i: number) {
    if (card.type === 'imageCard') {
      const img = (card as any).imageOverride || (card as any).imageUrl;
      const topRow = i <= 1;
      return (
        <div key={i} className={`${styles.card} ${this.privItems[i]}`}>
          {img && <img className={topRow ? styles.imgTop : styles.imgBot} src={img} alt={(card as any).title || 'image'} />}
          {(card as any).title?.trim() && (
            <div className={styles.cardPad}>
              <div className={styles.cardTitle}>{(card as any).title}</div>
            </div>
          )}
        </div>
      );
    }

    if (card.type === 'textCard') {
      const title = (card as any).title as string;
      const accents: string[] = (card as any).accentWords || [];

     
      const isImportance =
        /The\s+Importance\s+of\s+Staying\s+Fit\s+and\s+Active\s+for\s+Productivity/i.test(title);
      const accentTitle: boolean = Boolean((card as any).accentTitle) || isImportance;
      const twoColBullets: boolean = Boolean((card as any).twoCol) || isImportance;
      const bulletHeading: string =
        (card as any).bulletHeading || (isImportance ? 'Core Direction Employee Offer' : '');

      const parts = !accents.length ? [title] : title.split(new RegExp(`(${accents.map(esc).join('|')})`, 'gi'));
      const showSite = Boolean((card as any).ctaUrl || (card as any).ctaText);

      return (
        <div key={i} className={`${styles.card} ${styles.cardSoft} ${this.privItems[i]}`}>
          <div className={styles.cardPad}>
            {(card as any).logoUrl && (
              <div style={{ marginBottom: 12 }}>
                <img src={(card as any).logoUrl} alt="logo" style={{ height: 24, width: 'auto', display: 'block' }} />
              </div>
            )}

            <div className={`${styles.cardTitle} ${accentTitle ? styles.cardTitleRed : ''}`}>
              {accents.length
                ? parts.map((p, pi) =>
                    accents.some(a => a.toLowerCase() === p.toLowerCase())
                      ? <span key={pi} style={{ color: 'var(--accent)' }}>{p}</span>
                      : <span key={pi}>{p}</span>
                  )
                : title}
            </div>

            {(card as any).subtitle && <div className={styles.cardSubtitle}>{(card as any).subtitle}</div>}

            {showSite && (
              <div className={styles.siteRow}>
                <a className={styles.siteLink} href={(card as any).ctaUrl} target="_blank" rel="noreferrer">
                  <span className={styles.globe} aria-hidden="true" />
                  {(card as any).ctaText || (card as any).ctaUrl}
                </a>
              </div>
            )}

            {bulletHeading && <div className={styles.bulletHeading}>{bulletHeading}</div>}

            {Array.isArray((card as any).bullets) && (
              <ul className={`${styles.bullets} ${twoColBullets ? styles.bulletsTwoCol : ''}`} style={{ marginTop: 12 }}>
                {(card as any).bullets.map((b: string, bi: number) => <li key={bi}>{b}</li>)}
              </ul>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  /* ---------- MEDICAL ---------- */
  private renderMedicalCard(card: AnyCard, i: number) {
    if (card.type === 'imageCard') {
      const img = (card as any).imageOverride || (card as any).imageUrl;
      return (
        <div key={i} className={`${styles.card} ${styles.col4}`}>
          {img && <img className={styles.cardImage} src={img} alt={(card as any).title || 'image'} />}
          <div className={styles.cardBody}>
            <div className={styles.cardTitle}>{(card as any).title}</div>
            {(card as any).subtitle && <div className={styles.cardSubtitle}>{(card as any).subtitle}</div>}
            {(card as any).ctaUrl && (
              <div className={styles.ctaRow}>
                <a className={styles.ctaPrimary} href={(card as any).ctaUrl} target="_blank" rel="noreferrer">
                  {(card as any).ctaText || 'Open'}
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (card.type === 'textCard') {
      return (
        <div key={i} className={`${styles.card} ${styles.col4}`}>
          <div className={styles.cardBody}>
            <div className={styles.cardTitle}>{(card as any).title}</div>
            {(card as any).subtitle && <div className={styles.cardSubtitle}>{(card as any).subtitle}</div>}
            {Array.isArray((card as any).rows) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {(card as any).rows.map((r: any, ri: number) => (
                  <div key={ri} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span>{r.label}</span><span>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (card.type === 'infoCard') {
      const rows: any[] = (card as any).rows || [];
      const pick = (label: string) => rows.find(r => (r.label || '').toLowerCase() === label.toLowerCase());

      const phone = pick('Phone');
      const email = pick('Email');
      const wh = pick('Working Hours');
      const topImg = (card as any).imageUrl;

      const whText = (wh?.value || '').trim();
      const whParts = whText.split(/\s*\((.*)\)\s*$/);
      const whMain = whParts[0] || '';
      const whTz   = whParts[1] ? `(${whParts[1]})` : '';

      return (
        <div key={i} className={`${styles.card} ${styles.col4}`}>
          {topImg && <img className={styles.cardImage} src={topImg} alt="contact" />}

          <div className={styles.cardBody}>
            <div className={styles.infoHead}>Contact Info</div>

            {phone && (
              <div className={styles.infoRow}>
                <span>Phone</span>
                <a className={styles.infoVal} href={`tel:${(phone.value || '').replace(/\s+/g, '')}`}>
                  {phone.value}
                </a>
              </div>
            )}

            {email && (
              <div className={styles.infoRow}>
                <span>Email</span>
                <a className={styles.infoVal} href={`mailto:${email.value}`}>{email.value}</a>
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.infoBlockTitle}>Working Hours</div>
            {whMain && <div className={styles.infoBlockText}>{whMain}</div>}
            {whTz && <div className={styles.infoBlockMuted}>{whTz}</div>}
          </div>
        </div>
      );
    }

    if (card.type === 'banner') {
      const b: any = card;
      return (
        <div key={i} className={`${styles.promo} ${styles.col12}`}>
          <div className={styles.promoLeft}>
            <div className={styles.promoTitle} dangerouslySetInnerHTML={{ __html: b.title }} />
            {b.subtitle && <div className={styles.promoSub}>{b.subtitle}</div>}

            {Array.isArray(b.bullets) && b.bullets.length > 0 && (
              <ul className={styles.promoBullets}>
                {b.bullets.map((x: string, xi: number) => (
                  <li key={xi}><span className={styles.promoCheck} /> <span>{x}</span></li>
                ))}
              </ul>
            )}

            {Array.isArray(b.badges) && b.badges.length > 0 && (
              <div className={styles.promoBadges}>
                {b.badges.map((bd: any, bi: number) => (
                  <a key={bi} href={bd.linkUrl} target="_blank" rel="noreferrer">
                    <img className={styles.promoBadge} src={bd.imageUrl} alt="store badge" />
                  </a>
                ))}
              </div>
            )}
            {b.websiteUrl && (
              <div className={styles.promoSite}>
                <a className={styles.siteLink} href={b.websiteUrl} target="_blank" rel="noreferrer">
                  <span className={styles.globe} aria-hidden="true" />
                  {b.websiteText || b.websiteUrl}
                </a>
              </div>
            )}
          </div>
          <div className={styles.promoImgWrap}>
            {b.rightImageUrl && <img className={styles.promoImg} src={b.rightImageUrl} alt="app preview" />}
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { payload, loading, activeTab, error } = this.state;
    const isPriv = activeTab === 'privileges';
    const privTitle = isPriv ? (this.props.sectionTitlePrivileges || '').trim() : '';

    return (
      <div className={styles.wrapper}>
        {/* Breadcrumb */}
        <Breadcrumb homeUrl={this.props.homeUrl} />

        {/* Segmented tabs */}
        <div className={styles.segWrap}>
          <div className={styles.seg}>
            <button
              className={`${styles.segBtn} ${activeTab === 'medical' ? styles.segBtnActive : ''}`}
              onClick={() => this.load('medical')}
              type="button"
            >
              Medical Insurance
            </button>
            <button
              className={`${styles.segBtn} ${activeTab === 'privileges' ? styles.segBtnActive : ''}`}
              onClick={() => this.load('privileges')}
              type="button"
            >
              Employee Privileges
            </button>
          </div>
        </div>

        {/* Optional title for Privileges tab (black) */}
        {privTitle && (
          <div style={{ fontSize: 20, fontWeight: 800, margin: '6px 0 10px', color: 'var(--ink)' }}>
            {privTitle}
          </div>
        )}

        {/* Grid */}
        <div className={styles.grid}>
          {loading && (
            <>
              {isPriv
                ? Array.from({ length: 4 }).map((_, i: number) => (
                    <div key={i} className={`${styles.card} ${this.privItems[i]}`}>
                      <div className={styles.skel} style={{ height: i <= 1 ? 'var(--priv-top-h)' : 'var(--priv-bot-h)' }} />
                    </div>
                  ))
                : Array.from({ length: 3 }).map((_, i: number) => (
                    <div key={i} className={`${styles.card} ${styles.col4}`}>
                      <div className={styles.skel} style={{ height: 220, margin: 16 }} />
                    </div>
                  ))}
            </>
          )}

          {!loading && !error && payload?.cards?.map((c: AnyCard, i: number) =>
            isPriv ? this.renderPrivCard(c, i) : this.renderMedicalCard(c, i)
          )}

          {error && <div className={styles.col12}>Error: {error}</div>}
        </div>
      </div>
    );
  }
}
