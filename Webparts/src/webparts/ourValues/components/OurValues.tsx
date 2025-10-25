import * as React from 'react';
import styles from './OurValues.module.scss';
import type { IOurValuesProps } from './IOurValuesProps';
import { listServices, OurValueCard } from '../../services/listServices';
import { ListName } from "../../services/Constants";
import { Stack, Text, Image } from '@fluentui/react';
 
type State = { items: OurValueCard[]; loading: boolean; error?: string };
 
export default class OurValues extends React.Component<IOurValuesProps, State> {
  private spService: listServices;
 
  constructor(props: IOurValuesProps) {
    super(props);
    this.state = { items: [], loading: true };
    this.spService = new listServices(this.props.context);
  }
 
  async componentDidMount(): Promise<void> {
    try {
      const items: any = await this.spService.getOurValues(ListName.OUR_VALUES);
      this.setState({ items, loading: false });
    } catch (e: any) {
      this.setState({ loading: false, error: e?.message || 'Failed to load items.' });
    }
  }
 
  render(): React.ReactElement<IOurValuesProps> {
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
            {error && !loading && <Text styles={{ root: { color: '#c00' } }}>{error}</Text>}
 
            {!loading && !error && (
              <div className={styles.grid}>
                {items.map((item: any) => (
                  <div key={item.id} className={styles.card}>
                    {item.icon ? <Image src={item.icon} alt="" className={styles.icon} /> : null}
 
                    <Text className={styles.title}>
                      {item.title}
                    </Text>
 
                    <div
                      className={styles.description}
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Stack>
      </section>
    );
  }
}