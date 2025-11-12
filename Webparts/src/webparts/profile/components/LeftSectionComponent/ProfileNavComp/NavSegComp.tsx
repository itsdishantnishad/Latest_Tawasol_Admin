import * as React from "react";
import styles from "./NavSeg.module.scss";

export type NavKey = "storyline" | "activities" | "bookmarks";

export interface INavSegmentProps {
  value?: NavKey;                            
  defaultValue?: NavKey;                     
  onChange?: (value: NavKey) => void;        
  className?: string;
}

interface INavSegmentState {
  active: NavKey;
}

export default class NavSegment extends React.Component<INavSegmentProps, INavSegmentState> {
  public static defaultProps: Partial<INavSegmentProps> = {
    defaultValue: "storyline",
  };

  constructor(props: INavSegmentProps) {
    super(props);
    this.state = { active: props.value || props.defaultValue! };
  }

  componentDidUpdate(prevProps: INavSegmentProps) {
    if (this.props.value && this.props.value !== prevProps.value && this.props.value !== this.state.active) {
      this.setState({ active: this.props.value });
    }
  }

  private setActive = (key: NavKey) => {
    if (this.props.value) {
      this.props.onChange?.(key);
    } else {
      this.setState({ active: key }, () => this.props.onChange?.(key));
    }
  };

  private renderButton(key: NavKey, label: string) {
    const isActive = (this.props.value ?? this.state.active) === key;

    return (
      <button
        type="button"
        className={`${styles.segBtn} ${isActive ? styles.segBtnActive : ""}`}
        aria-pressed={isActive}
        aria-current={isActive ? "page" : undefined}
        onClick={() => this.setActive(key)}
      >
        <span className={styles.segText}>{label}</span>
      </button>
    );
  }

  public render(): React.ReactElement<INavSegmentProps> {
    return (
      <div className={`${styles.navWrap} ${this.props.className ?? ""}`} role="tablist" aria-label="Profile navigation">
        {/* left/right 8px placement handled by padding in container */}
        {this.renderButton("storyline", "Storyline")}
        {this.renderButton("activities", "All Activities")}
        {this.renderButton("bookmarks", "My Bookmarks")}
      </div>
    );
  }
}




