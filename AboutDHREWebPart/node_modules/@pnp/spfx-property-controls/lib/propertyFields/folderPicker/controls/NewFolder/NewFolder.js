var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as React from 'react';
import { Icon } from '@fluentui/react/lib/Icon';
import { IconButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import styles from './NewFolder.module.scss';
import * as strings from 'PropertyControlStrings';
import { FolderExplorerService } from '../../../../services/FolderExplorerService';
const addIcon = { iconName: 'CheckMark' };
export class NewFolder extends React.Component {
    constructor(props) {
        super(props);
        this._onFolderNameChange = (newValue) => {
            this.setState({ folderName: newValue || '' });
        };
        this._onShowInputChange = (event) => {
            this.setState({ showInput: true });
        };
        /**
       * Add new subfolder to current folder
       */
        this._addSubFolder = () => __awaiter(this, void 0, void 0, function* () {
            let newFolder = null;
            this.setState({ loading: true });
            try {
                const siteAbsoluteUrl = this.props.siteAbsoluteUrl || this.props.context.pageContext.web.absoluteUrl;
                const folder = yield this._spService.addFolder(siteAbsoluteUrl, this.props.selectedFolder.ServerRelativeUrl, this.state.folderName);
                // update folder variable to be used on the callback
                newFolder = { Name: folder.Name, ServerRelativeUrl: folder.ServerRelativeUrl };
                // update return variable
                this.setState({ loading: false, folderName: '' });
            }
            catch (error) {
                console.error('Error adding folder', error);
            }
            // callback
            this.props.addSubFolder(newFolder).then(() => { }).catch(() => { });
        });
        this._spService = new FolderExplorerService(this.props.context.serviceScope);
        this.state = {
            folderName: '',
            showInput: false,
            loading: false,
        };
    }
    render() {
        return (React.createElement("div", { className: styles.libraryItem },
            this.state.loading &&
                React.createElement("span", { className: styles.spinner },
                    React.createElement(Spinner, { size: SpinnerSize.xSmall })),
            !this.state.loading &&
                React.createElement(Icon, { iconName: "FabricNewFolder", className: styles.folderIcon }),
            !this.state.showInput &&
                React.createElement("div", { className: styles.defaultText, onClick: this._onShowInputChange }, "New folder"),
            this.state.showInput &&
                React.createElement(TextField, { placeholder: strings.NewFolderNamePlaceholder, value: this.state.folderName, onChange: (e, value) => this._onFolderNameChange(value) }),
            this.state.folderName.length > 0 &&
                React.createElement(IconButton, { iconProps: addIcon, title: "Add", ariaLabel: "Add", className: styles.button, disabled: this.state.loading, onClick: this._addSubFolder })));
    }
}
//# sourceMappingURL=NewFolder.js.map