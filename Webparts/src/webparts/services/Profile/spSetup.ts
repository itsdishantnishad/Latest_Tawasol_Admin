import { SPFI, spfi, SPFx } from "@pnp/sp";

let _sp: SPFI | null = null;

export const setupSP = (context: any): SPFI => {
  if (!context) {
    throw new Error("Context is required to initialize SPFx");
  }

  _sp = spfi().using(SPFx(context));
  return _sp;
};

export const getSP = (): SPFI => {
  if (!_sp) {
    throw new Error("SP not initialized. Call setupSP(context) from your webpart's onInit() first.");
  }
  return _sp;
};
