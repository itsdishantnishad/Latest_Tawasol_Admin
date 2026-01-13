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

