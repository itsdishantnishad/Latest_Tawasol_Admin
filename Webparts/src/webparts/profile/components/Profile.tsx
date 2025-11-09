import * as React from 'react';
import type { IProfileProps } from './IProfileProps';

import App from './App/App';
export default class Profile extends React.Component<IProfileProps> {
  public render(): React.ReactElement<IProfileProps> {
    return (
      <>
      <App/>
      </>
    );
  }
}
