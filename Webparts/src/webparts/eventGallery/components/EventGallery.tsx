import * as React from 'react';
import styles from './EventGallery.module.scss';
import type { IEventGalleryProps } from './IEventGalleryProps';
import EventGalleryHome from './EventGalleryHome/EventGalleryhome';
// import { CardTitlegallery } from './cardTitle/cardTitle';
export default class EventGallery extends React.Component<IEventGalleryProps> {
  public render(): React.ReactElement<IEventGalleryProps> {
    const {
    } = this.props;
    return (
   <>
      {/* <CardTitlegallery /> */}
      <EventGalleryHome context={this.props.context} Allevent={this.props.EventItem} />
       {/* Render event items here */}
   </>
    );
  }
}
