import * as React from "react";
import { PrimaryButton } from "@fluentui/react";
import { SPComponentLoader } from "@microsoft/sp-loader";
import styles from "./AnnouncementBanner.module.scss";

export interface IThumbsUpAcknowledgeButtonProps {
  onAcknowledge: () => void;
  acknowledged: boolean;
  buttonText?: string;
  className?: string;
  animationDurationMs?: number;
}

interface IThumbsUpAcknowledgeButtonState {
  isAnimating: boolean;
}

export default class ThumbsUpAcknowledgeButton
  extends React.Component<IThumbsUpAcknowledgeButtonProps, IThumbsUpAcknowledgeButtonState> {

  private buttonRef = React.createRef<HTMLButtonElement>();
  private mojs: any | null = null;
  private timeline: any | null = null;
  private loadedMojs = false;

  public static defaultProps: Partial<IThumbsUpAcknowledgeButtonProps> = {
    buttonText: "Noted 🤞🏻",
    animationDurationMs: 900
  };

  constructor(props: IThumbsUpAcknowledgeButtonProps) {
    super(props);
    this.state = { isAnimating: false };
  }

  private async ensureMojsLoaded(): Promise<void> {
    if (this.loadedMojs && this.mojs) return;
    await SPComponentLoader.loadScript(
      "https://cdn.jsdelivr.net/npm/@mojs/core",
      { globalExportsName: "mojs" }
    );
    this.mojs = (window as any).mojs;
    this.loadedMojs = true;
  }

  private async handleClick(): Promise<void> {
    if (!this.buttonRef.current) return;

    this.props.onAcknowledge();

    await this.ensureMojsLoaded();
    const host = this.buttonRef.current;

    const timeline = new this.mojs.Timeline();

    const burst = new this.mojs.Burst({
      parent: host,
      radius: { 30: 90 },
      count: 6,
      children: {
        fill: "#F4AE28",
        opacity: 0.6,
        radius: 15,
        duration: 1700,
        easing: this.mojs.easing.bezier(0.1, 1, 0.3, 1)
      }
    });

    const ring = new this.mojs.Shape({
      parent: host,
      type: "circle",
      radius: { 0: 60 },
      fill: "transparent",
      stroke: "#F4AE28",
      strokeWidth: { 20: 0 },
      opacity: 0.6,
      duration: 700,
      easing: this.mojs.easing.sin.out
    });

    timeline.add(burst, ring);
    this.timeline = timeline;

    this.setState({ isAnimating: true }, () => {
      this.timeline!.replay();
      window.setTimeout(() => {
        this.setState({ isAnimating: false });
      }, this.props.animationDurationMs);
    });
  }

  public render(): React.ReactElement<IThumbsUpAcknowledgeButtonProps> {
    const { acknowledged, buttonText, className } = this.props;
    const { isAnimating } = this.state;

    return (
      <div className={className}>
        {isAnimating && (
          <div  aria-hidden="true">👍</div>
        )}

        {!isAnimating && acknowledged && (
          <div  title="Acknowledged">👍</div>
        )}

        {!isAnimating && !acknowledged && (
          <PrimaryButton
            componentRef={this.buttonRef as any}
            text={buttonText}
            onClick={() => this.handleClick()}
          />
        )}
      </div>
    );
  }
}
