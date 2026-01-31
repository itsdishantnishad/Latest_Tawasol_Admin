import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import VivaEngageHeader from "./components/VivaEngageHeader";
import { IVivaEngageHeaderProps } from "./components/IVivaEngageHeaderProps";

export interface IVivaEngageHeaderWebPartProps {}

export default class VivaEngageHeaderWebPart extends BaseClientSideWebPart<IVivaEngageHeaderWebPartProps> {
  private _delayHandle: number | undefined;

  // ✅ keep delay (ms)
  private readonly _renderDelayMs: number = 2000;

  public render(): void {
    // cancel previous pending timer
    if (this._delayHandle) {
      window.clearTimeout(this._delayHandle);
      this._delayHandle = undefined;
    }

    // ✅ show shimmer immediately (no spinner)
    this._renderShimmerPlaceholder();

    // render actual component after delay
    this._delayHandle = window.setTimeout(() => {
      const element: React.ReactElement<IVivaEngageHeaderProps> = React.createElement(
        VivaEngageHeader,
        {}
      );

      ReactDom.render(element, this.domElement);
      this._delayHandle = undefined;
    }, this._renderDelayMs);
  }

  private _renderShimmerPlaceholder(): void {
    // unique scope per webpart instance to avoid CSS collisions
    const scope = `veHdrShimmer_${(this.instanceId || "x").replace(/-/g, "")}`;

    this.domElement.innerHTML = `
      <div class="${scope}">
        <div class="${scope}__wrap">
          <div class="${scope}__stripBox">
            <div class="${scope}__block ${scope}__strip"></div>
          </div>

          <div class="${scope}__titleBox">
            <div class="${scope}__block ${scope}__titleLine"></div>
            <div class="${scope}__block ${scope}__subLine"></div>
          </div>

          <div class="${scope}__stripBox">
            <div class="${scope}__block ${scope}__strip"></div>
          </div>
        </div>
      </div>

      <style>
        .${scope}{
          width:100%;
          min-height:200px;
          background:#fff4ea;
          border-radius: 8px;
          display:flex;
          align-items:center;
          justify-content:center;
          box-sizing:border-box;
          padding: 24px 12px;
        }

        .${scope}__wrap{
          width:min(980px, 100%);
          display:flex;
          align-items:center;
          justify-content:center;
          gap: 18px;
        }

        .${scope}__stripBox{
          flex: 0 0 auto;
          width: 180px;
          max-width: 28%;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .${scope}__titleBox{
          flex: 0 1 520px;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap: 10px;
        }

        .${scope}__block{
          border-radius: 12px;
          background: linear-gradient(
            90deg,
            rgba(0,0,0,0.06) 25%,
            rgba(0,0,0,0.12) 37%,
            rgba(0,0,0,0.06) 63%
          );
          background-size: 400% 100%;
          animation: ${scope}__shimmer 1.2s ease-in-out infinite;
        }

        .${scope}__strip{
          height: 18px;
          width: 100%;
          border-radius: 999px;
        }

        .${scope}__titleLine{
          height: 22px;
          width: 340px;
          max-width: 92%;
          border-radius: 14px;
        }

        .${scope}__subLine{
          height: 14px;
          width: 260px;
          max-width: 75%;
          border-radius: 12px;
        }

        @keyframes ${scope}__shimmer{
          0%{ background-position: 100% 0; }
          100%{ background-position: 0 0; }
        }

        @media (max-width: 640px){
          .${scope}__stripBox{ display:none; }
          .${scope}__wrap{ gap: 10px; }
        }
      </style>
    `;
  }

  protected onDispose(): void {
    if (this._delayHandle) {
      window.clearTimeout(this._delayHandle);
      this._delayHandle = undefined;
    }
    ReactDom.unmountComponentAtNode(this.domElement);
    this.domElement.innerHTML = "";
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
