import { spfi, SPFI, SPFx } from "@pnp/sp"; 
import { WebPartContext } from "@microsoft/sp-webpart-base"; 

let _sp: SPFI | null = null;

export const setupSP = (context: WebPartContext): SPFI => {
  if (_sp) return _sp;

  console.log("Setting up PnP with context:", context);
  _sp = spfi().using(SPFx(context));

  console.log("PnP SP instance created:", _sp);

  return _sp;
};

export const getSP = (context?: WebPartContext): SPFI => {
  if (context && !_sp) {
    console.log("Creating new SP instance with context");
    _sp = spfi().using(SPFx(context)); 
  }

  // Ensure that the SP instance is initialized
  if (!_sp) {
    throw new Error("PnP JS not initialized. Call setupSP(context) first in your web part's onInit().");
  }

  return _sp;
};
