import * as React from 'react';
import styles from './PoliciesAndProcedures.module.scss';
import { CategoryItem, DepartmentItem } from './Landing';
import { FocusZone, FocusZoneDirection, Image, ImageFit, Link } from '@fluentui/react';

interface ITilesProps {
  variant: 'core' | 'support';
  categories: CategoryItem[];
  departments: DepartmentItem[];
  searchText: string;
}

export default class Tiles extends React.Component<ITilesProps> {
  private match = (t: string, q: string) => !q || t.toLowerCase().indexOf(q.toLowerCase()) >= 0;

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
              >
                <div className={styles.coreThumb}>
                  {/* 1) Inline SVG markup */}
                  {it.svgMarkup && (
                    <div
                      className={styles.svgWrap}
                      dangerouslySetInnerHTML={{ __html: it.svgMarkup }}
                    />
                  )}

                  {/* 2) External SVG/PNG/JPG path */}
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

    // Support Function – tile GRID
    const depts = departments.filter(d => this.match(d.title, searchText));
    return (
      <FocusZone isCircularNavigation={true} direction={FocusZoneDirection.bidirectional}>
        <div className={styles.supportGrid}>
          {depts.map(d => (
            <Link
              key={d.key}
              className={styles.supportTile}
              href={`#/policies/views/${d.key}`}
              underline={false}
              aria-label={d.title}
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
