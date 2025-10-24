import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ILetsCelebrateWebPartProps } from "../LetsCelebrateWebPart";

export interface ILetsCelebrateProps extends ILetsCelebrateWebPartProps {

  context:WebPartContext
}
