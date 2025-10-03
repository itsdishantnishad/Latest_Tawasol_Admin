import * as React from 'react';
// import styles from './AppPanel.module.scss';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';


interface IMyPanelProps {
  isOpen: boolean;
  onClosePanel: () => void;
}

interface IMyPanelState {
  isPanelOpen: boolean;
  inputValue: string;
}

class AppPanel extends React.Component<IMyPanelProps, IMyPanelState> {
  constructor(props: IMyPanelProps) {
    super(props);
    this.state = {
      isPanelOpen: false,
      inputValue: ''
    };
  }


  // private _onOpenPanel = (): void => {
  //   this.setState({ isPanelOpen: true });
  // };

  private _onClosePanel = (): void => {
this.state.isPanelOpen
  }

  private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    this.setState({ inputValue: newValue || '' });
  };


  private _onRenderFooterContent = (): JSX.Element => {
    return (
      <div>
        <DefaultButton style={{ marginRight: 8 }}>
          Close
        </DefaultButton>
        <DefaultButton primary onClick={() => alert(`Saved: ${this.state.inputValue}`)}>
          Save
        </DefaultButton>
      </div>
    );
  };

  public render(): React.ReactElement<IMyPanelProps> {
    return (
      <div>

        <Panel
          isOpen={this.state.isPanelOpen}
          onDismiss={this._onClosePanel}
          headerText="My Custom Panel"
          type={PanelType.medium} // or PanelType.smallFixedFar, large, etc.
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this._onRenderFooterContent}
          isFooterAtBottom={true}
        >
          <TextField
            label="Enter some text"
            value={this.state.inputValue}
            onChange={this._onInputChange}
          />
          {/* Add more content and controls here */}
        </Panel>
      </div>
    );
  }
};

export default AppPanel;
