// import * as React from 'react';
// import styles from './EventGallery.module.scss';
// import type { IEventGalleryProps } from './IEventGalleryProps';
// import EventGalleryHome from './EventGalleryHome/EventGalleryhome';
// // import { CardTitlegallery } from './cardTitle/cardTitle';
// export default class EventGallery extends React.Component<IEventGalleryProps> {
//   public render(): React.ReactElement<IEventGalleryProps> {
//     const {
//     } = this.props;
//     return (
//    <>
//       {/* <CardTitlegallery /> */}
//       <EventGalleryHome context={this.props.context} Allevent={this.props.EventItem} />
//        {/* Render event items here */}
//    </>
//     );
//   }
// }


import * as React from "react";
import type { IEventGalleryProps } from "./IEventGalleryProps";
import App from "./App/App";

export default class EventGallery extends React.Component<IEventGalleryProps> {
  public render(): React.ReactElement<IEventGalleryProps> {
    return (
      <App
        context={this.props.context}
        eventItems={this.props.EventItem || []}
        sitePagesListTitle={this.props.sitePagesListTitle}
        contentTypeName={this.props.contentTypeName}
        maxItems={this.props.maxItems}
        letsMeetDescription={this.props.letsMeetDescription}
      />
    );
  }
}

