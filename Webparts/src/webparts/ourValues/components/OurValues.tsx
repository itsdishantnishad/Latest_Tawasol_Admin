import * as React from 'react';
import styles from './OurValues.module.scss';
import type { IOurValuesProps } from './IOurValuesProps';
import { listServices } from '../../services/listServices';
import { ListName } from '../../services/Constants';
import { Stack, Text, Image } from '@fluentui/react';

type State = {
  items: any[];
  loading: boolean;
  error?: string;
};

export default class OurValues extends React.Component<IOurValuesProps, State> {
  private spService: listServices;

  constructor(props: IOurValuesProps) {
    super(props);
    this.state = {
      items: [],
      loading: true,
      error: undefined
    };

    this.spService = new listServices(this.props.context);
  }

  public async componentDidMount(): Promise<void> {
    try {
      const items: any[] = await this.spService.getOurValues(ListName.OUR_VALUES);
      this.setState({ items, loading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load items.';
      this.setState({ loading: false, error: message });
    }
  }

  public render(): React.ReactElement<IOurValuesProps> {
    const { items, loading, error } = this.state;

    return (
      <section className={styles.fullBleed}>
        <Stack className={styles.root}>
          <div className={styles.container}>
            {/* Static heading per spec */}
            <div className={styles.heading}>
              <Text as="span" className={styles.headingOur}>Our</Text>
              <Text as="span" className={styles.headingValues}>Values</Text>
            </div>

            {loading && <Text>Loading…</Text>}
            {error && !loading && (
              <Text styles={{ root: { color: '#c00' } }}>{error}</Text>
            )}

            {!loading && !error && items.length > 0 && (
              <>
                {/* Desktop / tablet: 4-column grid */}
                <div className={styles.grid}>
                  {items.map((item: any) => (
                    <div key={item.id} className={styles.card}>
                      {item.icon && (
                        <Image src={item.icon} alt="" className={styles.icon} />
                      )}
                      <Text className={styles.title}>{item.title}</Text>
                      <div
                        className={styles.description}
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile: swipeable carousel (no dots, no arrows) */}
                <div className={styles.carousel}>
                  <div className={styles.carouselViewport}>
                    <div className={styles.carouselTrack}>
                      {items.map((item: any) => (
                        <div key={item.id} className={styles.carouselSlide}>
                          <div className={styles.card}>
                            {item.icon && (
                              <Image src={item.icon} alt="" className={styles.icon} />
                            )}
                            <Text className={styles.title}>{item.title}</Text>
                            <div
                              className={styles.description}
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Stack>
      </section>
    );
  }
}
