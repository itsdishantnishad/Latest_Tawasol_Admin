import * as React from 'react';
import styles from './OurValues.module.scss';
import type { IOurValuesProps } from './IOurValuesProps';
import { listServices, OurValueCard } from '../../services/listServices';
import { ListName } from "../../services/Constants";
import { Stack, Text, Image, IStackStyles, IStackTokens, IImageStyles } from '@fluentui/react';

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

    // Fluent UI styles/tokens (kept tiny)
    const rootStyles: IStackStyles = { root: { padding: '48px 24px' } };
    const gridStyles: IStackStyles = { root: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 24 } };
    const gridClass = 'ovGrid'; // plain class for media queries
    const gridMQ = `
      @media (max-width:1100px){ .${gridClass} { grid-template-columns: repeat(2,1fr); } }
      @media (max-width:640px){  .${gridClass} { grid-template-columns: 1fr; } }
    `;
    const cardStyles: IStackStyles = {
      root: { height: 212, border: '1px solid #E6E0DA', borderRadius: 10, background: '#fff', padding: '24px 16px' }
    };
    const iconStyles: IImageStyles = {
      root: { maxWidth: 60, maxHeight: 60 },
      image: { objectFit: 'contain', width: 'auto', height: 'auto' }
    };
    const headingGap: IStackTokens = { childrenGap: 8 };

    return (
      <section className={styles.fullBleed}>
        <style>{gridMQ}</style>
        <Stack styles={rootStyles}>
          <div className={styles.container}>
            {/* Static heading per spec */}
            <Stack horizontal horizontalAlign="center" tokens={headingGap} className={styles.heading}>
              <Text as="span" className={styles.headingOur}>Our</Text>
              <Text as="span" className={styles.headingValues}>Values</Text>
            </Stack>

            {loading && <Text>Loading…</Text>}
            {error && !loading && <Text styles={{ root: { color: '#c00' } }}>{error}</Text>}

            {!loading && !error && (
              <Stack styles={gridStyles} className={gridClass}>
                {items.map((item: any) => (
                  <Stack key={item.id} tokens={{ childrenGap: 16 }} styles={cardStyles}>
                    <Stack horizontalAlign="start">
                      {item.icon ? <Image src={item.icon} alt="" styles={iconStyles} /> : null}
                    </Stack>
                    <Text variant="large" styles={{ root: { fontWeight: 600, color: '#111' } }}>
                      {item.title}
                    </Text>

                    <div className={styles.description} dangerouslySetInnerHTML={{ __html: item.description }}></div>
                  </Stack>
                ))}
              </Stack>
            )}
          </div>
        </Stack>
      </section>
    );
  }
}
