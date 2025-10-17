import * as React from 'react';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import { IconsList } from '../iconsList/IconsList';
import * as strings from 'PropertyControlStrings';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import debounce from 'lodash/debounce';
import styles from './IconSelector.module.scss';
import { FluentIconsService } from '../../services/FluentIconsService';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Icon } from '@fluentui/react/lib/Icon';
import Dialog, { DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import { initializeIcons } from '@fluentui/react/lib/Icons';
initializeIcons();
const _fluentIconsService = new FluentIconsService();
const _icons = _fluentIconsService.getAll();
export const IconSelector = ({ renderOption = 'panel', currentIcon, panelClassName, panelType = PanelType.medium, dialogType = DialogType.normal, isOpen, onChange, onDismiss, onSave }) => {
    const [selectedIconName, setSelectedIconName] = React.useState();
    const [icons, setIcons] = React.useState();
    const onSelectedIconChange = React.useCallback((iconName) => {
        setSelectedIconName(iconName);
        if (onChange) {
            onChange(iconName);
        }
    }, [onChange]);
    const internalOnDismiss = React.useCallback(() => {
        setSelectedIconName(currentIcon);
        if (onDismiss) {
            onDismiss();
        }
    }, [currentIcon, onDismiss]);
    const onSearchAbort = React.useCallback(() => {
        setIcons(_icons);
    }, []);
    const onSearchChange = React.useCallback((searchText) => {
        let items;
        if (searchText && searchText.trim().length > 2) {
            items = _fluentIconsService.search(searchText);
        }
        else {
            items = _fluentIconsService.getAll();
        }
        setIcons(items);
    }, []);
    const confirmSelection = React.useCallback(() => {
        if (onSave) {
            onSave(selectedIconName);
        }
    }, [selectedIconName]);
    const renderContent = () => {
        return React.createElement("div", null,
            React.createElement(IconsList, { icons: icons, selectedIconName: selectedIconName, onChange: onSelectedIconChange }));
    };
    const renderPanelNav = (props, defaultRender) => {
        return React.createElement("div", { className: styles.navArea },
            React.createElement("h2", { className: styles.headTitle }, strings.SelectIcon),
            React.createElement(SearchBox, { className: styles.searchBox, onAbort: onSearchAbort, "data-automation-id": `icon-picker-search`, onSearch: debounce(onSearchChange, 300), onChange: debounce((e, value) => onSearchChange(value), 300) }),
            React.createElement("div", { className: styles.closeBtnContainer }, defaultRender(props)));
    };
    const renderPanelFooter = () => {
        return React.createElement("div", { className: styles.footer, "data-automation-id": `icon-picker-footer` },
            React.createElement(PrimaryButton, { text: strings.SaveButtonLabel, onClick: confirmSelection, disabled: !selectedIconName, className: styles.btnSave, "data-automation-id": `icon-picker-save` }),
            React.createElement("div", { className: `${styles.selectionDisplay} ${selectedIconName ? 'noSelection' : ''}` },
                React.createElement("span", { className: styles.selectionLabel },
                    strings.SelectedLabel,
                    ":"),
                React.createElement(Icon, { iconName: selectedIconName, className: styles.selectionIcon })),
            React.createElement(DefaultButton, { text: strings.CancelButtonLabel, onClick: internalOnDismiss, className: styles.btnCancel, "data-automation-id": `icon-picker-close` }));
    };
    const renderPanel = () => {
        return React.createElement(Panel, { isOpen: isOpen, onDismiss: internalOnDismiss, type: panelType, "data-automation-id": `icon-picker-panel`, closeButtonAriaLabel: strings.CloseButton, className: panelClassName, onRenderNavigation: renderPanelNav, onRenderFooterContent: renderPanelFooter, isFooterAtBottom: true }, renderContent());
    };
    const renderDialog = () => {
        return React.createElement(Dialog, { hidden: !isOpen, onDismiss: internalOnDismiss, isBlocking: true, containerClassName: styles.dialog, dialogContentProps: {
                type: dialogType,
                title: strings.SelectIcon,
                showCloseButton: true,
                className: panelClassName
            } },
            React.createElement(SearchBox, { className: styles.searchBox, onAbort: onSearchAbort, "data-automation-id": `icon-picker-search`, onSearch: debounce(onSearchChange, 300), onChange: debounce((e, value) => onSearchChange(value), 300) }),
            React.createElement("div", { className: styles.dialogIconsContainer }, renderContent()),
            React.createElement(DialogFooter, null,
                React.createElement("div", { className: styles.dialogFooter },
                    React.createElement(Icon, { iconName: selectedIconName, className: styles.dialogSelectedIcons }),
                    React.createElement(PrimaryButton, { className: styles.save, text: strings.SaveButtonLabel, onClick: confirmSelection, disabled: !selectedIconName, "data-automation-id": `icon-picker-save` }),
                    React.createElement(DefaultButton, { text: strings.CancelButtonLabel, onClick: internalOnDismiss, className: styles.btnCancel, "data-automation-id": `icon-picker-close` }))));
    };
    React.useEffect(() => {
        setIcons(_icons);
    }, []);
    React.useEffect(() => {
        if (isOpen === false) {
            setIcons(_icons);
        }
    }, [isOpen]);
    React.useEffect(() => {
        setSelectedIconName(currentIcon);
    }, [currentIcon]);
    return (React.createElement(React.Fragment, null, renderOption === 'panel' ? renderPanel() : renderDialog()));
};
//# sourceMappingURL=IconSelector.js.map