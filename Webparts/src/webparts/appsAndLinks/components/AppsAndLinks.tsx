import * as React from 'react';
import styles from './AppsAndLinks.module.scss';
import type { IAppsAndLinksProps } from './IAppsAndLinksProps';
import AppPanel from './AppPanel';


const apps = [
  { name: "Add Custom Links", icon: "➕" },
  { name: "Linkedin", icon: "🔗" },
  { name: "Meraas.com", icon: "🔗" },
  { name: "Workflow", icon: "💲" },
  { name: "Tahweel", icon: "🔄" },
  { name: "Data Protection", icon: "📋" },
  { name: "Leave Request", icon: "📊" },
  { name: "Workflow", icon: "⚡" },
  { name: "Tahweel", icon: "🔄" },
  { name: "Data Protection", icon: "📋" },
  { name: "Leave Request", icon: "📊" },
  { name: "Workflow", icon: "⚡" },
];

interface IAppsAndLinksState {
  isPanelOpen: boolean;
}

export default class AppsAndLinks extends React.Component<IAppsAndLinksProps, IAppsAndLinksState> {
  constructor(props: IAppsAndLinksProps) {
    super(props);
    this.state = {
      isPanelOpen: false
    };
  }

  onOpenPanel = (): void => {
    this.setState({ isPanelOpen: true });
  };

  onClosePanel = (): void => {
    this.setState({ isPanelOpen: false });
  };

  public render(): React.ReactElement<IAppsAndLinksProps> {
    const {

    } = this.props;

    return (
      <div className="apps-links-container">
        <h2>Apps & Links</h2>
        <div className={styles.grid}>
          <div>
            <AppPanel onClosePanel={this.onClosePanel} isOpen={this.state.isPanelOpen} />
          </div>
          {apps.map((app, index) => (
            <div className="app-item" key={index}>
              <div className="icon">{app.icon}</div>
              <div className="label">{app.name}</div>
            </div>
          ))}
        </div>
      </div>

    );
  }
}
