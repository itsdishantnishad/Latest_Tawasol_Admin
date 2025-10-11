import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';


import * as strings from 'ExtensionsApplicationCustomizerStrings';
require("../../styles/hideNav.css");



const LOG_SOURCE: string = 'ExtensionsApplicationCustomizer';


export interface IExtensionsApplicationCustomizerProperties {
  
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class ExtensionsApplicationCustomizer
  extends BaseApplicationCustomizer<IExtensionsApplicationCustomizerProperties> {

  public static addClass = (selector: any, ...tokens: any[]) => document.querySelector(selector)?.classList.add(...tokens);

  public static hasClass = (selector: any, className: any) => document.querySelector(selector)?.classList.contains(className);

  public static removeClass = (selector: any, ...tokens: any[]) => document.querySelector(selector)?.classList.remove(...tokens);

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    // const ele: any = document.getElementById("SuiteNavWrapper")
    // ele.classList.add('hide');
    ExtensionsApplicationCustomizer.addClass('#hide-ribbon-inner', 'ribbonClosed');
    ExtensionsApplicationCustomizer.addClass('#SuiteNavWrapper', 'hide'); 

   

    

    return Promise.resolve();
  }
}
