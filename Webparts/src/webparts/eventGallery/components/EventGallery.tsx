import * as React from 'react';
import styles from './EventGallery.module.scss';
import type { IEventGalleryProps } from './IEventGalleryProps';
import EventGalleryHome from './EventGalleryHome/EventGalleryhome';
import { CardTitlegallery } from './cardTitle/cardTitle';

export default class EventGallery extends React.Component<IEventGalleryProps> {
  public render(): React.ReactElement<IEventGalleryProps> {
    const {
    } = this.props;

    return (
   <>
   <div className={styles.eventGallery}>
     <div>
      <CardTitlegallery />
      <EventGalleryHome />
       {/* Render event items here */}
     </div>
   </div>
   </>
    );
  }
}
