import * as React from 'react';
import styles from './FolderTile.module.scss';
import { css } from '@fluentui/react/lib/Utilities';
import { Icon, IconType } from '@fluentui/react/lib/Icon';
import * as strings from 'PropertyControlStrings';
import { ScreenWidthMinLarge } from '@fluentui/react/lib/Styling';
export class FolderTile extends React.Component {
    render() {
        const { isSelected, index, item, pageWidth } = this.props;
        const isLarge = pageWidth >= ScreenWidthMinLarge;
        //{item.name}, Folder, Modified {item.modified}, edited by {item.modifiedBy}, {item.totalFileCount} items, Private
        const itemLabel = strings.FolderLabelTemplate
            .replace('{0}', item.name)
            .replace('{1}', item.modifiedFriendly)
            .replace('{2}', item.modifiedBy)
            .replace('{3}', `${item.totalFileCount}`);
        // Get the user's locale
        const userLocale = this.props.context.pageContext
            ? this.props.context.pageContext.cultureInfo.currentCultureName || this.props.context.pageContext.cultureInfo.currentUICultureName // gets the language / locale of the user
            : "en-US"; // defaults to American English
        return (React.createElement("div", { "aria-selected": isSelected, "data-is-draggable": false, role: "listitem", "aria-labelledby": `Tile-label${index}`, "aria-describedby": `Tile-activity${index}`, className: css(styles.tile, isLarge ? styles.isLarge : styles.isSmall, styles.invokable, isSelected ? styles.selected : undefined), "data-is-focusable": true, "data-is-sub-focuszone": true, "data-disable-click-on-enter": true, "data-selection-index": index, onClick: (_event) => this.props.onItemInvoked(item) },
            React.createElement("div", { className: styles.link, role: "link" },
                React.createElement("span", { id: `Tile-label${index}`, className: styles.label }, itemLabel),
                React.createElement("span", { role: "presentation", className: styles.aboveNameplate },
                    React.createElement("span", { role: "presentation", className: styles.content },
                        React.createElement("span", { role: "presentation", className: styles.foreground },
                            React.createElement("span", { className: styles.odItemTile2FolderCover },
                                React.createElement("div", { className: css(styles.folderCover, styles.isLarge) },
                                    React.createElement(Icon, { className: styles.folderCoverBack, iconType: IconType.image, imageProps: {
                                            src: strings.FolderBackPlate
                                        } }),
                                    item.totalFileCount > 0 &&
                                        React.createElement("span", { className: styles.folderCoverContent },
                                            React.createElement("span", { className: styles.folderCoverFrame },
                                                React.createElement("span", { className: styles.itemTileBlankCover, style: { width: 104, height: 72 } }))),
                                    React.createElement(Icon, { className: styles.folderCoverFront, iconType: IconType.image, imageProps: {
                                            src: strings.FolderFrontPlate
                                        } }),
                                    item.totalFileCount > 0 &&
                                        React.createElement("span", { className: styles.metadata }, item.totalFileCount)))))),
                React.createElement("span", { className: styles.namePlate },
                    React.createElement("span", { className: styles.name },
                        React.createElement("span", { className: css(styles.signalField, styles.compact) },
                            React.createElement("span", { className: styles.signalFieldValue }, item.name))),
                    React.createElement("span", { className: styles.activity, id: `Tile-activity${index}` },
                        React.createElement("span", { className: css(styles.signalField, styles.compact) },
                            React.createElement("span", { className: styles.signalFieldValue }, item.modified.toLocaleDateString(userLocale))))))));
    }
}
//# sourceMappingURL=FolderTile.js.map