import * as React from 'react';
import { Stack, Text, Image, PrimaryButton } from '@fluentui/react';
import { DashboardItem } from '../../services/listServices';
import ui from './Dashboards.module.scss';

export interface IDashboardDetailProps {
  item: DashboardItem;
  related: DashboardItem[];
  onOpen: (item: DashboardItem) => void;
  onViewAll: () => void;

  showSection: boolean;
  showViewAll: boolean;
}

export default class DashboardDetail extends React.Component<IDashboardDetailProps, {}> {
  render(): React.ReactElement<IDashboardDetailProps> {
    const { item, related, onOpen, onViewAll, showSection, showViewAll } = this.props;

    return (
      <Stack tokens={{ childrenGap: 12 }}>
        <Text variant="xLarge" className={ui.detailTitle}>{item.title}</Text>
        {item.body && <Text variant="small" className={ui.detailDesc}>{item.body}</Text>}

        <div className={ui.embedWrap}>
          {item.embedUrl ? (
            <iframe
              title={item.title}
              src={item.embedUrl}
              width="100%"
              height={540}
              frameBorder={0}
              allowFullScreen
            />
          ) : (
            <div className={ui.embedPlaceholder}>
              <Text>No embed URL configured.</Text>
            </div>
          )}
        </div>

        {showSection && (
          <>
            <Text variant="large" className={ui.moreTitle}>More Dashboards</Text>

            <div className={ui.relatedGrid}>
              {related.map(it => (
                <div
                  key={it.id}
                  className={ui.card}
                  onClick={() => onOpen(it)}
                  title={it.title}
                >
                  {it.thumbUrl ? (
                    <Image src={it.thumbUrl} alt="" className={ui.cardImg} />
                  ) : (
                    <div className={ui.cardImg} />
                  )}
                  <Text variant="medium" className={ui.cardTitle}>{it.title}</Text>
                  {it.body && <Text variant="small" className={ui.cardBody}>{it.body}</Text>}
                </div>
              ))}
            </div>

            {showViewAll && (
              <div className={ui.viewAllRow}>
                <PrimaryButton className={ui.viewButtonBlack} text="View All" onClick={onViewAll} />
              </div>
            )}
          </>
        )}
      </Stack>
    );
  }
}
