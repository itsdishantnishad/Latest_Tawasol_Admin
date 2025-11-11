import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';
import { FunctionCategory, SupportDepartment } from './Landing';
import { FocusZone, FocusZoneDirection, Image, ImageFit, Link } from '@fluentui/react';

interface ITilesProps {
  variant: 'core' | 'support';
  categories: FunctionCategory[];
  departments: SupportDepartment[];
  searchText: string;
  onOpenFunctionView: (functionDisplayName: string) => void;
}

export default class Tiles extends React.Component<ITilesProps> {
  /** Text match predicate used for filtering items by search text */
  private matchesSearchQuery = (text: string, query: string) =>
    !query || text.toLowerCase().includes(query.toLowerCase());

  /** CURRENT: open in-webpart Function View; FUTURE: see commented navigation options */
  private handleTileSelect = (displayName: string, targetHref?: string): void => {
    this.props.onOpenFunctionView(displayName);

    /**
     * FUTURE OPTION — Navigate to a target page instead of opening the in-webpart view.
     * Uncomment to redirect when a URL is present.
     */
    // if (targetHref) {
    //   window.location.assign(targetHref); // or window.open(targetHref, '_self') / '_blank'
    //   return;
    // }
  };

  public render(): React.ReactElement<ITilesProps> {
    const { variant, categories, departments, searchText } = this.props;

    if (variant === 'core') {
      const visibleCategories = categories.filter(c => this.matchesSearchQuery(c.title, searchText));
      return (
        <FocusZone isCircularNavigation direction={FocusZoneDirection.bidirectional}>
          <div className={styles.coreGrid}>
            {visibleCategories.map(cat => (
              <div
                key={cat.key}
                className={styles.coreTile}
                role="button"
                aria-label={cat.title}
                tabIndex={0}
                onClick={() => this.handleTileSelect(cat.title, cat.href)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleTileSelect(cat.title, cat.href);
                  }
                }}
              >
                <div className={styles.coreThumb}>
                  {cat.svgMarkup && (
                    <div
                      className={styles.svgWrap}
                      dangerouslySetInnerHTML={{ __html: cat.svgMarkup }}
                    />
                  )}
                  {!cat.svgMarkup && (cat.svgSrc || cat.imageSrc) && (
                    <Image
                      src={(cat.svgSrc || cat.imageSrc) as string}
                      alt={cat.title}
                      shouldFadeIn
                      imageFit={ImageFit.cover}
                      width="100%"
                      height="100%"
                    />
                  )}
                </div>
                <div className={styles.coreCaption}><span>{cat.title}</span></div>
              </div>
            ))}
          </div>
        </FocusZone>
      );
    }

    const visibleDepartments = departments.filter(d => this.matchesSearchQuery(d.title, searchText));
    return (
      <FocusZone isCircularNavigation direction={FocusZoneDirection.bidirectional}>
        <div className={styles.supportGrid}>
          {visibleDepartments.map(dep => (
            <Link
              key={dep.key}
              className={styles.supportTile}
              href="#"
              underline={false}
              aria-label={dep.title}
              onClick={(e) => { e.preventDefault(); this.handleTileSelect(dep.title, dep.href); }}
              // FUTURE: remove preventDefault and rely on dep.href to navigate directly.
            >
              <div className={styles.supportIcon}>
                <Image src={dep.iconSrc} alt="" imageFit={ImageFit.contain} width={46} height={46} />
              </div>
              <div className={styles.supportTitle}>{dep.title}</div>
            </Link>
          ))}
        </div>
      </FocusZone>
    );
  }
}
