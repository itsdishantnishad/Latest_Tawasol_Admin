import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/behaviors/spfx";
var _sp;
export var getSP = function (context) {
    if (!_sp && context) {
        _sp = spfi().using(SPFx(context));
    }
    return _sp;
};
//# sourceMappingURL=pnpConfig.js.map