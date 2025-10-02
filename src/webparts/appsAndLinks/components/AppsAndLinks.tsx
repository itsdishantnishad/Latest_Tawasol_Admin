import * as React from 'react';
import styles from './AppsAndLinks.module.scss';
import type { IAppsAndLinksProps } from './IAppsAndLinksProps';


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

export default class AppsAndLinks extends React.Component<IAppsAndLinksProps, {}> {

  public render(): React.ReactElement<IAppsAndLinksProps> {
    const {
  
    } = this.props;

    return (
      <div className="apps-links-container">
        <h2>Apps & Links</h2>
        <div className={styles.grid}>
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
