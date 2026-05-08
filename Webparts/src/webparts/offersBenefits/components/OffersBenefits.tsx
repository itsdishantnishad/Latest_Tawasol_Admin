import * as React from "react";
import styles from "./OffersBenefits.module.scss";

import { PayloadModel, AnyCard } from "./types";
import { fetchJson, readPlaceholder } from "./Api";
import GlobalBreadcrumbs from "../../assets/GlobalBreadcrumbs";

const GlobeIcon: string = require("../assets/globe.png");
const GlobeIcon1: string = require("../assets/globeblack.png");

export interface IOffersBenefitsProps {
  mode: "placeholder" | "api";
  api: { baseUrl: string; medicalPath: string; privilegesPath: string };
  placeholders: { medical: string; privileges: string };
  cacheMinutes: number;
  maxItems: number;

  sectionTitleMedical: string;
  sectionTitlePrivileges: string;

  homeUrl?: string;
}

interface State {
  loading: boolean;
  activeTab: "medical" | "privileges";
  payload?: PayloadModel;
  error?: string;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default class OffersBenefits extends React.Component<
  IOffersBenefitsProps,
  State
> {
  private abort?: AbortController;

  state: State = { loading: true, activeTab: "medical" };

  componentDidMount() {
    this.load(this.state.activeTab);
  }

  componentWillUnmount() {
    this.abort?.abort();
  }

  private cacheKey(tab: "medical" | "privileges") {
    const { mode, api, placeholders, maxItems } = this.props;
    return `ob:v13:${mode}:${tab}:${api.baseUrl}:${api.medicalPath}:${api.privilegesPath}:${placeholders[tab].length}:${maxItems}`;
  }

  private async load(tab: "medical" | "privileges") {
    try {
      this.setState({ loading: true, activeTab: tab, error: undefined });

      const key = this.cacheKey(tab);
      const ttl = this.props.cacheMinutes * 60 * 1000;
      const cached = sessionStorage.getItem(key);

      if (cached) {
        const { t, data } = JSON.parse(cached);
        if (Date.now() - t < ttl) {
          this.setState({ payload: data, loading: false });
          return;
        }
      }

      let data: PayloadModel;

      if (this.props.mode === "placeholder") {
        data = readPlaceholder(
          tab === "medical"
            ? this.props.placeholders.medical
            : this.props.placeholders.privileges
        );
      } else {
        this.abort?.abort();
        this.abort = new AbortController();

        const url =
          this.props.api.baseUrl +
          (tab === "medical"
            ? this.props.api.medicalPath
            : this.props.api.privilegesPath);

        data = await fetchJson(url, this.abort.signal);
      }

      if (Array.isArray((data as any).cards) && this.props.maxItems > 0) {
        (data as any).cards = (data as any).cards.slice(0, this.props.maxItems);
      }

      sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), data }));
      this.setState({ payload: data, loading: false });
    } catch (e: any) {
      this.setState({ error: e?.message || "Failed to load", loading: false });
    }
  }

  // ===========================
  // PRIVILEGES (4 cards)
  // ===========================
  private renderPrivCard(card: AnyCard, i: number) {
    const hookWrap =
      i === 0
        ? styles.privTopLeftCard
        : i === 1
        ? styles.privTopRightCard
        : i === 2
        ? styles.privBottomLeftCard
        : i === 3
        ? styles.privBottomRightCard
        : styles.privCardAny;

    if (card.type === "imageCard") {
      const img = (card as any).imageOverride || (card as any).imageUrl;

      return (
        <div
          key={i}
          className={`${styles.cardWrap} ${styles.privCardWrap} ${hookWrap}`}
        >
          <div className={`${styles.card} ${styles.privCard}`}>
            {img && <img className={styles.privImage} src={img} alt="" />}
          </div>
        </div>
      );
    }

    if (card.type === "textCard") {
      const rawTitle = String((card as any).title || "");
      const accents: string[] = Array.isArray((card as any).accentWords)
        ? (card as any).accentWords
        : [];

      const isImportance =
        /The\s+Importance\s+of\s+Staying\s+Fit\s+and\s+Active\s+for\s+Productivity/i.test(
          rawTitle
        );

      const wantAllRed: boolean =
        Boolean((card as any).accentTitle) || isImportance;
      const wholeTitleRed: boolean = wantAllRed && i !== 0;

      const twoColBullets: boolean =
        Boolean((card as any).twoCol) || isImportance;

      const bulletHeading: string =
        (card as any).bulletHeading ||
        (isImportance ? "Core Direction Employee Offer" : "");

      const parts = !accents.length
        ? [rawTitle]
        : rawTitle.split(new RegExp(`(${accents.map(esc).join("|")})`, "gi"));

      const showSite = Boolean((card as any).ctaUrl || (card as any).ctaText);

      const titleClass =
        i === 0
          ? styles.privTopLeftTitle
          : i === 3
          ? styles.privBottomRightTitle
          : styles.privTitleAny;

      const subtitleClass =
        i === 0
          ? styles.privTopLeftSub
          : i === 3
          ? styles.privBottomRightSub
          : styles.privSubAny;

      return (
        <div
          key={i}
          className={`${styles.cardWrap} ${styles.privCardWrap} ${hookWrap}`}
        >
          <div
            className={`${styles.card} ${styles.privCard} ${styles.privTextCard}`}
          >
            <div className={styles.privTextPad}>
              {(card as any).logoUrl && (
                <div className={styles.privLogoRow}>
                  <img
                    src={(card as any).logoUrl}
                    alt="logo"
                    className={styles.privLogo}
                  />
                </div>
              )}

              <div
                className={`${styles.privTitleBase} ${titleClass} ${
                  wholeTitleRed ? styles.privTitleRed : ""
                }`}
              >
                {accents.length
                  ? parts.map((p, pi) =>
                      accents.some((a) => a.toLowerCase() === p.toLowerCase()) ? (
                        <span key={pi} className={styles.privAccentWord}>
                          {p}
                        </span>
                      ) : (
                        <span key={pi}>{p}</span>
                      )
                    )
                  : rawTitle}
              </div>

              {(card as any).subtitle && (
                <div className={`${styles.privSubBase} ${subtitleClass}`}>
                  {(card as any).subtitle}
                </div>
              )}

              {showSite && (
                <div className={styles.privSiteRow}>
                  <a
                    className={styles.privSiteLink}
                    href={(card as any).ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={GlobeIcon} className={styles.privGlobeIcon} alt="" />
                    {(card as any).ctaText || (card as any).ctaUrl}
                  </a>
                </div>
              )}

              {bulletHeading && (
                <div className={styles.privBulletHeading}>{bulletHeading}</div>
              )}

              {Array.isArray((card as any).bullets) && (
                <ul
                  className={`${styles.privBullets} ${
                    twoColBullets ? styles.privBulletsTwoCol : ""
                  }`}
                >
                  {(card as any).bullets.map((b: string, bi: number) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // ===========================
  // MEDICAL (3 cards + banner)
  // ===========================
  private renderMedicalCard(card: AnyCard, i: number) {
    const hookWrap =
      i === 0
        ? styles.medHospitalCard
        : i === 1
        ? styles.medBenefitsCard
        : i === 2
        ? styles.medContactCard
        : i === 3
        ? styles.medBannerWrap
        : styles.medCardAny;

    if (card.type === "imageCard") {
      const img = (card as any).imageOverride || (card as any).imageUrl;

      const titleClass =
        i === 0
          ? styles.medHospitalTitle
          : i === 1
          ? styles.medBenefitsTitle
          : styles.medTitleAny;

      const subClass =
        i === 0
          ? styles.medHospitalSub
          : i === 1
          ? styles.medBenefitsSub
          : styles.medSubAny;

      const imgClass =
        i === 0
          ? styles.medHospitalImg
          : i === 1
          ? styles.medBenefitsImg
          : styles.medImgAny;

      const btnClass =
        i === 0
          ? styles.medHospitalBtn
          : i === 1
          ? styles.medBenefitsBtn
          : styles.medBtnAny;

      return (
        <div
          key={i}
          className={`${styles.cardWrap} ${styles.medCardWrap} ${hookWrap}`}
        >
          <div className={`${styles.card} ${styles.medCard}`}>
            {img && (
              <img
                className={`${styles.medCardImage} ${imgClass}`}
                src={img}
                alt=""
              />
            )}

            <div className={styles.medBody}>
              <div className={`${styles.medTitleBase} ${titleClass}`}>
                {(card as any).title}
              </div>

              {(card as any).subtitle && (
                <div className={`${styles.medSubBase} ${subClass}`}>
                  {(card as any).subtitle}
                </div>
              )}

              {(card as any).ctaUrl && (
                <div className={styles.medCtaRow}>
                  <a
                    className={`${styles.medCtaBtn} ${btnClass}`}
                    href={(card as any).ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {(card as any).ctaText || "Open"}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (card.type === "infoCard") {
      const rows: any[] = (card as any).rows || [];
      const pick = (label: string) =>
        rows.find(
          (r) => String(r.label || "").toLowerCase() === label.toLowerCase()
        );

      const phone = pick("Phone");
      const email = pick("Email");
      const wh = pick("Working Hours");
      const topImg = (card as any).imageUrl;

      const whText = String(wh?.value || "").trim();
      const whParts = whText.split(/\s*\((.*)\)\s*$/);
      const whMain = whParts[0] || "";
      const whTz = whParts[1] ? `(${whParts[1]})` : "";

      return (
        <div
          key={i}
          className={`${styles.cardWrap} ${styles.medCardWrap} ${hookWrap}`}
        >
          <div className={`${styles.card} ${styles.medCard}`}>
            {topImg && (
              <img
                className={`${styles.medCardImage} ${styles.medContactImg}`}
                src={topImg}
                alt=""
              />
            )}

            <div className={styles.medBody}>
              <div className={styles.medContactHead}>Contact Info</div>

              {phone && (
                <div className={styles.medInfoRow}>
                  <span>Phone :</span>
                  <a
                    className={styles.medInfoVal}
                    href={`tel:${String(phone.value || "").replace(/\s+/g, "")}`}
                  >
                    {phone.value}
                  </a>
                </div>
              )}

              {email && (
                <div className={styles.medInfoRow}>
                  <span>Email :</span>
                  <a className={styles.medInfoVal} href={`mailto:${email.value}`}>
                    {email.value}
                  </a>
                </div>
              )}

              {/* <div className={styles.line}>
                <hr />
              </div> */}

              <div className={styles.medWorkTitle}>Working Hours</div>
              {whMain && <div className={styles.medWorkText}>{whMain}</div>}
              {whTz && <div className={styles.medWorkMuted}>{whTz}</div>}
            </div>
          </div>
        </div>
      );
    }

    if (card.type === "banner") {
      const b: any = card;

      return (
        <div
          key={i}
          className={`${styles.cardWrap} ${styles.medBannerWrap} ${hookWrap}`}
        >
          {/* ✅ waveOffset on the banner => controls both waves together */}
          <div className={`${styles.medBanner} ${styles.waveOffset}`}>
            <div className={styles.medBannerLeft}>
              <div
                className={styles.medBannerTitle}
                dangerouslySetInnerHTML={{ __html: b.title }}
              />
              {b.subtitle && <div className={styles.medBannerSub}>{b.subtitle}</div>}

              {Array.isArray(b.bullets) && b.bullets.length > 0 && (
                <ul className={styles.medBannerBullets}>
                  {b.bullets.map((x: string, xi: number) => (
                    <li key={xi}>
                      <span className={styles.medBannerCheck} /> <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}

              {Array.isArray(b.badges) && b.badges.length > 0 && (
                <div className={styles.medBannerBadges}>
                  {b.badges.map((bd: any, bi: number) => (
                    <a key={bi} href={bd.linkUrl} target="_blank" rel="noreferrer">
                      <img
                        className={styles.medBannerBadge}
                        src={bd.imageUrl}
                        alt="store badge"
                      />
                    </a>
                  ))}
                </div>
              )}

              {b.websiteUrl && (
                <div className={styles.medBannerSiteRow}>
                  <a
                    className={styles.medBannerSiteLink}
                    href={b.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={GlobeIcon1}
                      className={styles.medBannerGlobeIcon}
                      alt=""
                    />
                    {b.websiteText || b.websiteUrl}
                  </a>
                </div>
              )}
            </div>

            <div className={styles.medBannerRight}>
              {b.rightImageUrl && (
                <img className={styles.medBannerImg} src={b.rightImageUrl} alt="" />
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  render() {
    const { payload, loading, activeTab, error } = this.state;
    const isPriv = activeTab === "privileges";
    const cards: AnyCard[] = (payload as any)?.cards || [];

    const medBanner = cards.find((c: AnyCard) => c.type === "banner");
    const medNonBanner = cards.filter((c: AnyCard) => c.type !== "banner");

    const privTop = cards.slice(0, 2);
    const privBottom = cards.slice(2, 4);

    const sectionTitle = !isPriv
      ? this.props.sectionTitleMedical
      : this.props.sectionTitlePrivileges;

    return (
      <div
        className={`${styles.wrapper} ${
          activeTab === "medical" ? styles.isMedical : styles.isPrivileges
        }`}
      >
        <div className={styles.container}>
          <div className={styles.segRow}>
            <div className={styles.breadPosition}>
              <GlobalBreadcrumbs />
            </div>
            <div className={styles.segWrap}>
              <div className={styles.seg}>
                <button
                  className={`${styles.segBtn} ${
                    activeTab === "medical" ? styles.segBtnActive : ""
                  }`}
                  onClick={() => this.load("medical")}
                  type="button"
                >
                  Medical Insurance
                </button>

                <button
                  className={`${styles.segBtn} ${
                    activeTab === "privileges" ? styles.segBtnActive : ""
                  }`}
                  onClick={() => this.load("privileges")}
                  type="button"
                >
                  Employee Privileges
                </button>
              </div>
            </div>
          </div>

          {!!sectionTitle && <div className={styles.sectionTitle}>{sectionTitle}</div>}

          <div className={styles.grid}>
            {error && <div className={styles.error}>Error: {error}</div>}

            {loading && !error && (
              <>
                {!isPriv ? (
                  <>
                    <div className={styles.medGridTop}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`${styles.cardWrap} ${styles.medCardWrap} ${
                            i === 0
                              ? styles.medHospitalCard
                              : i === 1
                              ? styles.medBenefitsCard
                              : styles.medContactCard
                          }`}
                        >
                          <div className={`${styles.card} ${styles.skel}`} />
                        </div>
                      ))}
                    </div>

                    <div className={styles.medGridBottom}>
                      <div className={`${styles.cardWrap} ${styles.medBannerWrap}`}>
                        <div className={`${styles.card} ${styles.skel}`} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.privGridTop}>
                      {[0, 1].map((i) => (
                        <div
                          key={i}
                          className={`${styles.cardWrap} ${styles.privCardWrap} ${
                            i === 0 ? styles.privTopLeftCard : styles.privTopRightCard
                          }`}
                        >
                          <div className={`${styles.card} ${styles.skel}`} />
                        </div>
                      ))}
                    </div>

                    <div className={styles.privGridBottom}>
                      {[2, 3].map((i) => (
                        <div
                          key={i}
                          className={`${styles.cardWrap} ${styles.privCardWrap} ${
                            i === 2 ? styles.privBottomLeftCard : styles.privBottomRightCard
                          }`}
                        >
                          <div className={`${styles.card} ${styles.skel}`} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {!loading && !error && (
              <>
                {!isPriv ? (
                  <>
                    <div className={styles.medGridTop}>
                      {medNonBanner.map((c: AnyCard, i: number) =>
                        this.renderMedicalCard(c, i)
                      )}
                    </div>

                    {medBanner && (
                      <div className={styles.medGridBottom}>
                        {this.renderMedicalCard(medBanner, 3)}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.privGridTop}>
                      {privTop.map((c: AnyCard, i: number) => this.renderPrivCard(c, i))}
                    </div>

                    <div className={styles.privGridBottom}>
                      {privBottom.map((c: AnyCard, bi: number) =>
                        this.renderPrivCard(c, bi + 2)
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}