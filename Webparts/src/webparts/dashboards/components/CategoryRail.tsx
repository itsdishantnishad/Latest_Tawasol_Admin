import * as React from 'react';
import { Text } from '@fluentui/react';
import { DashboardCategory } from '../../services/listServices';
import ui from './Dashboards.module.scss';

export interface ICategoryRailProps {
  items: DashboardCategory[];
  selectedId?: number;
  onSelect: (cat: DashboardCategory) => void;
}

export default class CategoryRail extends React.Component<ICategoryRailProps, {}> {
  render(): React.ReactElement<ICategoryRailProps> {
    const { items, selectedId, onSelect } = this.props;

    return (
      <nav className={ui.catWrap} aria-label="Dashboard Categories">
        {items.map(cat => {
          const active = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              className={`${ui.catBtn} ${active ? ui.catBtnActive : ''}`}
              onClick={() => onSelect(cat)}
              aria-pressed={active}
              title={cat.name}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </nav>
    );
  }
}
