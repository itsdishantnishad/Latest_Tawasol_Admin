import { SPFI, spfi, SPFx } from "@pnp/sp";
let _sp: SPFI | null = null;

export const setupSP = (context?: any): SPFI => {
  if (_sp) return _sp; 

  if (context) {
    _sp = spfi().using(SPFx(context));
  } else {
    const absoluteUrl =
      (window as any)?._spPageContextInfo?.webAbsoluteUrl ??
      document.location.origin;
    _sp = spfi(absoluteUrl);
  }

  return _sp;
};

export const getSP = (): SPFI => {
  if (!_sp) {
    const absoluteUrl =
      (window as any)?._spPageContextInfo?.webAbsoluteUrl ??
      document.location.origin;
    _sp = spfi(absoluteUrl);
  }
  return _sp;
};
