import * as React from 'react';
import { IconButton, Label, DragDropHelper, EventGroup } from '@fluentui/react';
import * as telemetry from '../../common/telemetry';
import styles from './PropertyFieldOrderHost.module.scss';
import { isEqual } from '@microsoft/sp-lodash-subset';
export default class PropertyFieldOrderHost extends React.Component {
    constructor(props, state) {
        super(props);
        this.registerRef = (ref) => {
            this._refs.push(ref);
        };
        this.setupSubscriptions = () => {
            if (!this.props.disableDragAndDrop && !this.props.disabled) {
                this._refs.forEach((value, index) => {
                    this._ddSubs.push(this._ddHelper.subscribe(value, new EventGroup(value), {
                        eventMap: [
                            {
                                callback: (context) => {
                                    this._draggedItem = context.data;
                                },
                                eventName: 'dragstart',
                            },
                        ],
                        selectionIndex: index,
                        context: { data: this.state.items[index], index: index },
                        updateDropState: (isDropping, event) => {
                            if (isDropping) {
                                value.classList.add(styles.dragEnter);
                            }
                            else {
                                value.classList.remove(styles.dragEnter);
                            }
                        },
                        canDrop: (dropContext, dragContext) => {
                            return true;
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        canDrag: (item) => {
                            return true;
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onDrop: (item) => {
                            if (this._draggedItem) {
                                this.insertBeforeItem(item);
                            }
                        },
                        onDragEnd: () => {
                            this._draggedItem = null;
                        },
                    }));
                });
                //Create dropable area below list to allow items to be dragged to the bottom
                if (this._refs.length && typeof this._lastBox !== 'undefined') {
                    this._ddSubs.push(this._ddHelper.subscribe(this._lastBox, new EventGroup(this._lastBox), {
                        selectionIndex: this._refs.length,
                        context: { data: {}, index: this._refs.length },
                        updateDropState: (isDropping, event) => {
                            if (isDropping) {
                                this._refs[this._refs.length - 1].classList.add(styles.dragLast);
                            }
                            else {
                                this._refs[this._refs.length - 1].classList.remove(styles.dragLast);
                            }
                        },
                        canDrop: (dropContext, dragContext) => {
                            return true;
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onDrop: (item, event) => {
                            if (this._draggedItem) {
                                const itemIndex = this.state.items.indexOf(this._draggedItem);
                                this.moveItemAtIndexToTargetIndex(itemIndex, this.state.items.length - 1);
                            }
                        },
                    }));
                }
            }
        };
        this.cleanupSubscriptions = () => {
            while (this._ddSubs.length) {
                const sub = this._ddSubs.pop(); // eslint-disable-line @typescript-eslint/no-explicit-any
                sub.dispose();
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.insertBeforeItem = (item) => {
            const itemIndex = this.state.items.indexOf(this._draggedItem);
            let targetIndex = this.state.items.indexOf(item);
            if (itemIndex < targetIndex) {
                targetIndex -= 1;
            }
            this.moveItemAtIndexToTargetIndex(itemIndex, targetIndex);
        };
        this.onMoveUpClick = (itemIndex) => {
            if (itemIndex > 0) {
                this.moveItemAtIndexToTargetIndex(itemIndex, itemIndex - 1);
            }
        };
        this.onMoveDownClick = (itemIndex) => {
            if (itemIndex < this.state.items.length - 1) {
                this.moveItemAtIndexToTargetIndex(itemIndex, itemIndex + 1);
            }
        };
        this.moveItemAtIndexToTargetIndex = (itemIndex, targetIndex) => {
            if (itemIndex !== targetIndex &&
                itemIndex > -1 &&
                targetIndex > -1 &&
                itemIndex < this.state.items.length &&
                targetIndex < this.state.items.length) {
                const items = this.state.items; // eslint-disable-line @typescript-eslint/no-explicit-any
                items.splice(targetIndex, 0, ...items.splice(itemIndex, 1));
                this.setState({
                    items: items,
                });
                this.props.valueChanged(items);
            }
        };
        telemetry.track('PropertyFieldOrder', {
            disabled: props.disabled,
        });
        this._selection = null;
        this._ddHelper = new DragDropHelper({
            selection: this._selection,
        });
        this._refs = new Array();
        this._ddSubs = new Array(); // eslint-disable-line @typescript-eslint/no-explicit-any
        this._draggedItem = null;
        this.state = {
            items: [],
        };
    }
    render() {
        const { items } = this.state;
        return (React.createElement("div", { className: styles.propertyFieldOrder },
            this.props.label && React.createElement(Label, null, this.props.label),
            React.createElement("ul", { style: {
                    maxHeight: this.props.maxHeight
                        ? this.props.maxHeight + 'px'
                        : '100%',
                }, className: !this.props.disabled ? styles.enabled : styles.disabled },
                items &&
                    items.length > 0 &&
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    items.map((value, index) => {
                        return (React.createElement("li", { ref: this.registerRef, key: index, draggable: !this.props.disableDragAndDrop && !this.props.disabled, style: {
                                cursor: !this.props.disableDragAndDrop && !this.props.disabled
                                    ? 'pointer'
                                    : 'default',
                            } }, this.renderItem(value, index)));
                    }),
                items && items.length > 0 && (React.createElement("div", { className: styles.lastBox, ref: (ref) => {
                        this._lastBox = ref;
                    } })))));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderItem(item, index) {
        return (React.createElement("div", null,
            React.createElement("div", { className: styles.itemBox }, this.renderDisplayValue(item, index)),
            !this.props.removeArrows && React.createElement("div", null, this.renderArrows(index))));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderDisplayValue(item, index) {
        if (typeof this.props.onRenderItem === 'function') {
            return this.props.onRenderItem(item, index);
        }
        else {
            return (React.createElement("span", null, this.props.textProperty
                ? item[this.props.textProperty]
                : item.toString()));
        }
    }
    renderArrows(index) {
        const arrowButtonStyles = {
            root: {
                width: '14px',
                height: '100%',
                display: 'inline-block',
            },
            rootDisabled: {
                backgroundColor: 'transparent',
            },
            icon: {
                fontSize: '10px',
            },
        };
        return (React.createElement("div", null,
            React.createElement(IconButton, { disabled: this.props.disabled || index === 0, iconProps: { iconName: this.props.moveUpIconName }, onClick: () => {
                    this.onMoveUpClick(index);
                }, styles: arrowButtonStyles }),
            React.createElement(IconButton, { disabled: this.props.disabled || index === this.props.items.length - 1, iconProps: { iconName: this.props.moveDownIconName }, onClick: () => {
                    this.onMoveDownClick(index);
                }, styles: arrowButtonStyles })));
    }
    UNSAFE_componentWillMount() {
        this.setState({
            items: this.props.items || [],
        });
    }
    componentDidMount() {
        this.setupSubscriptions();
    }
    UNSAFE_componentWillUpdate(nextProps) {
        // Check if the provided items are still the same
        if (!isEqual(nextProps.items, this.state.items)) {
            this.setState({
                items: this.props.items || [],
            });
        }
    }
    componentDidUpdate() {
        this.cleanupSubscriptions();
        this.setupSubscriptions();
    }
    componentWillUnmount() {
        this.cleanupSubscriptions();
    }
}
//# sourceMappingURL=PropertyFieldOrderHost.js.map