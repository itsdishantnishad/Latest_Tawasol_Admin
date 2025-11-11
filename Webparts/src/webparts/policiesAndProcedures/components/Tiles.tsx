import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';
import { CategoryItem, DepartmentItem } from './Landing';
import { FocusZone, FocusZoneDirection, Image, ImageFit, Link } from '@fluentui/react';

interface ITilesProps {
  variant: 'core' | 'support';
  categories: CategoryItem[];
  departments: DepartmentItem[];
  searchText: string;
  onOpen: (functionDisplayName: string) => void;
}

export default class Tiles extends React.Component<ITilesProps> {
  private match = (t: string, q: string) => !q || t.toLowerCase().indexOf(q.toLowerCase()) >= 0;

  private handleTileOpen = (title: string, href?: string): void => {
    // We only need the display name for the view; routing handled by parent
    this.props.onOpen(title);
  };

  public render(): React.ReactElement<ITilesProps> {
    const { variant, categories, departments, searchText } = this.props;

    if (variant === 'core') {
      const data = categories.filter(c => this.match(c.title, searchText));
      return (
        <FocusZone isCircularNavigation={true} direction={FocusZoneDirection.bidirectional}>
          <div className={styles.coreGrid}>
            {data.map(it => (
              <div
                key={it.key}
                className={styles.coreTile}
                role="button"
                aria-label={it.title}
                tabIndex={0}
                onClick={() => this.handleTileOpen(it.title, it.href)}
              >
                <div className={styles.coreThumb}>
                  {it.svgMarkup && (
                    <div
                      className={styles.svgWrap}
                      dangerouslySetInnerHTML={{ __html: it.svgMarkup }}
                    />
                  )}
                  {!it.svgMarkup && (it.svgSrc || it.imageSrc) && (
                    <Image
                      src={(it.svgSrc || it.imageSrc) as string}
                      alt={it.title}
                      shouldFadeIn
                      imageFit={ImageFit.cover}
                      width="100%"
                      height="100%"
                    />
                  )}
                </div>
                <div className={styles.coreCaption}><span>{it.title}</span></div>
              </div>
            ))}
          </div>
        </FocusZone>
      );
    }

    const depts = departments.filter(d => this.match(d.title, searchText));
    return (
      <FocusZone isCircularNavigation={true} direction={FocusZoneDirection.bidirectional}>
        <div className={styles.supportGrid}>
          {depts.map(d => (
            <Link
              key={d.key}
              className={styles.supportTile}
              href="#"
              underline={false}
              aria-label={d.title}
              onClick={(e) => { e.preventDefault(); this.handleTileOpen(d.title, d.href); }}
            >
              <div className={styles.supportIcon}>
                <Image src={d.iconSrc} alt="" imageFit={ImageFit.contain} width={46} height={46} />
              </div>
              <div className={styles.supportTitle}>{d.title}</div>
            </Link>
          ))}
        </div>
      </FocusZone>
    );
  }
}
