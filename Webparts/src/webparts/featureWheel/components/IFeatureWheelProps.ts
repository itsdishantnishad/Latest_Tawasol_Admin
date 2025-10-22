import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IFeatureWheelWebPartProps } from "../FeatureWheelWebPart";

export interface IFeatureWheelProps extends IFeatureWheelWebPartProps{
context:WebPartContext
}
