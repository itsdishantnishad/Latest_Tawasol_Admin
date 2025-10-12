import * as React from 'react';
import styles from './FeatureWheel.module.scss';
import type { IFeatureWheelProps } from './IFeatureWheelProps';
import { AppsAndLinks } from '../../Components/AppsAndLinks/AppsAndLinks';
import { listServices } from '../../services/listServices';

// const apps = [
//   { name: "Linkedin", icon: "🔗" },
//   { name: "Meraas.com", icon: "🔗" },
//   { name: "Workflow", icon: "💲" },
//   { name: "Tahweel", icon: "🔄" },
//   { name: "Data Protection", icon: "📋" },
//   { name: "Leave Request", icon: "📊" },
//   { name: "Workflow", icon: "⚡" },
//   { name: "Tahweel", icon: "🔄" },
//   { name: "Data Protection", icon: "📋" },
//   { name: "Leave Request", icon: "📊" },
//   { name: "Workflow", icon: "⚡" },
// ];

interface IFeatureWheelState {
  isDialogOpen: boolean;
  appsLinks: any[];
}

export default class FeatureWheel extends React.Component<IFeatureWheelProps, IFeatureWheelState> {
  private spService: listServices;
  constructor(props: IFeatureWheelProps) {
    super(props);
    this.state = {
      isDialogOpen: true,
      appsLinks: []
    };
    this.spService = new listServices(this.props.context);
  }

  onOpenDialog = async (): Promise<void> => {

    const appLinks = await this.spService.getApps("Apps");
    this.setState({
      isDialogOpen: false,
      appsLinks: appLinks
    });
  };

  onCloseDialog = () => {
    this.setState({ isDialogOpen: true });
  }

  public render(): React.ReactElement<IFeatureWheelProps> {
    const {

    } = this.props;

    return (
      <div className="apps-links-container">
        <h2>Apps & Links</h2>
        <div className={styles.grid}>
          <a onClick={this.onOpenDialog}>Apps And Links</a>
          <AppsAndLinks
            isHidden={this.state.isDialogOpen}
            savedApps={this.state.appsLinks}
            hideAppsAndLinks={this.onCloseDialog} />
        </div>
      </div>
    );
  }
}
