import * as React from 'react';
import styles from './DocumentTile.module.scss';
import { css } from '@fluentui/react/lib/Utilities';
import { Image, ImageFit } from '@fluentui/react/lib/Image';
import * as strings from 'PropertyControlStrings';
import { Check } from '@fluentui/react/lib/Check';
import { ScreenWidthMinLarge } from '@fluentui/react/lib/Styling';
const MAX_ASPECT_RATIO = 3;
export class DocumentTile extends React.Component {
    render() {
        const { isSelected, index, item, pageWidth, tileDimensions } = this.props;
        const isLarge = pageWidth >= ScreenWidthMinLarge;
        // Find the dimensions that are biggest
        let thumbnailWidth = tileDimensions.width;
        let thumbnailHeight = tileDimensions.height;
        if (item.dimensions) {
            const contentAspectRatio = item.dimensions.width / item.dimensions.height;
            const boundsAspectRatio = tileDimensions.width / tileDimensions.height;
            let scale;
            if (contentAspectRatio > boundsAspectRatio) {
                scale = tileDimensions.width / item.dimensions.width;
            }
            else {
                scale = tileDimensions.height / item.dimensions.height;
            }
            const finalScale = Math.min(MAX_ASPECT_RATIO, scale);
            thumbnailWidth = item.dimensions.width * finalScale;
            thumbnailHeight = item.dimensions.height * finalScale;
        }
        // Check extension and get preview
        const thumbnail = this.props.fileBrowserService.getFileThumbnailUrl(this.props.item, thumbnailWidth, thumbnailHeight);
        const ariaLabel = strings.ImageAriaLabelTemplate.replace('{0}', item.fileIcon);
        const itemLabel = strings.DocumentLabelTemplate
            .replace('{0}', item.name)
            .replace('{1}', item.modifiedFriendly)
            .replace('{2}', item.modifiedBy);
        return (React.createElement("div", { "aria-selected": isSelected, "data-is-draggable": false, role: "listitem", "aria-labelledby": `Tile-label${index}`, "aria-describedby": `Tile-activity${index}`, className: css(styles.tile, isLarge ? styles.isLarge : styles.isSmall, styles.invokable, styles.selectable, isSelected ? styles.selected : undefined), "data-is-focusable": true, "data-is-sub-focuszone": true, "data-disable-click-on-enter": true, "data-selection-index": index, 
            //data-selection-invoke={true}
            onClick: (_event) => this.props.onItemInvoked(item) },
            React.createElement("div", { className: styles.link, role: "link" },
                React.createElement("span", { id: `Tile-label${index}`, className: styles.label }, itemLabel),
                React.createElement("span", { role: "presentation", className: styles.aboveNameplate },
                    React.createElement("span", { role: "presentation", className: styles.content },
                        React.createElement("span", { role: "presentation", className: styles.foreground },
                            React.createElement("span", { className: styles.odItemTile2Image },
                                React.createElement("span", { className: styles.odImageFrame2, style: { width: thumbnailWidth, height: thumbnailHeight } },
                                    React.createElement("span", { className: styles.odImageFrame2Image },
                                        React.createElement("span", { className: styles.odImageFrame },
                                            React.createElement("span", { className: styles.odImageStack },
                                                React.createElement("span", { className: styles.odImageStackTile },
                                                    React.createElement("span", { className: styles.odImageTile },
                                                        React.createElement("span", { className: styles.odImageTileBackground },
                                                            React.createElement(Image, { src: thumbnail, width: thumbnailWidth, height: thumbnailHeight, imageFit: ImageFit.contain })))))))))),
                        React.createElement("span", { className: styles.odItemTile2SmallIcon },
                            React.createElement("div", { className: styles.fileTypeIcon, "aria-label": ariaLabel, title: ariaLabel },
                                React.createElement("img", { className: styles.fileTypeIconIcon, src: strings.ODPhotoIconUrl, style: { width: 16, height: 16 } }))))),
                React.createElement("span", { className: styles.namePlate },
                    React.createElement("span", { className: styles.name },
                        React.createElement("span", { className: css(styles.signalField, styles.compact) },
                            React.createElement("span", { className: styles.signalFieldValue }, item.name))),
                    React.createElement("span", { className: styles.activity, id: `Tile-activity${index}` },
                        React.createElement("span", { className: css(styles.signalField, styles.compact) },
                            React.createElement("span", { className: styles.signalFieldValue }, item.modifiedFriendly))))),
            React.createElement("span", { role: "checkbox", className: styles.check, "data-selection-toggle": true, "aria-checked": isSelected },
                React.createElement(Check, { checked: isSelected }))));
    }
}
//# sourceMappingURL=DocumentTile.js.map