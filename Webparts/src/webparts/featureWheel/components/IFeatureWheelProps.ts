// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { IReadonlyTheme } from "@microsoft/sp-component-base";
// import { IFeatureWheelWebPartProps } from "../FeatureWheelWebPart";

// export interface IFeatureWheelProps extends IFeatureWheelWebPartProps {
//   context: WebPartContext;
//   themeVariant?: IReadonlyTheme;
// }









import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { IFeatureWheelWebPartProps } from "../FeatureWheelWebPart";

export interface IFeatureWheelProps extends IFeatureWheelWebPartProps {
  context: WebPartContext;
  themeVariant?: IReadonlyTheme;
}
