

import * as React from 'react';
import view from './ViewPage.module.scss';
import { IPoliciesAndProceduresItem } from './ViewPageList';
import { ICON_PREVIEW_PLACEHOLDER } from '../../../assets/constants';

export interface IPoliciesAndProceduresPreviewProps {
  item?: IPoliciesAndProceduresItem;
  categoryTitle?: string;
}

export default class PoliciesAndProceduresPreview
  extends React.Component<IPoliciesAndProceduresPreviewProps> {

  private renderPlaceholderGlyph(): JSX.Element {
    return (
      <img
        src={ICON_PREVIEW_PLACEHOLDER}
        alt=""
        className={view.previewIconImg}
      />
    );
  }

  public render(): React.ReactElement<IPoliciesAndProceduresPreviewProps> {
    const { item, categoryTitle } = this.props;

    // ✅ IMPORTANT: preview should show placeholder until user clicks a file
    if (!item || item.isFolder) {
      return (
        <div className={view.previewCard}>
          {this.renderPlaceholderGlyph()}
          <div className={view.previewTitle}>
            Select an item in {categoryTitle || 'this category'}
          </div>
          <div className={view.previewMeta}>to view it here.</div>
        </div>
      );
    }

    return (
      <div className={view.previewCard}>
        {item.previewUrl ? (
          <iframe
            title={item.name}
            src={item.previewUrl}
            className={view.previewFrame}
          />
        ) : (
          <>
            {this.renderPlaceholderGlyph()}
            <div className={view.previewTitle}>{item.name}</div>
            <div className={view.previewMeta}>No preview available</div>
          </>
        )}
      </div>
    );
  }
}



