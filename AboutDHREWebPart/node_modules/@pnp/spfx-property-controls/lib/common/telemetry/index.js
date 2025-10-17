import PnPTelemetry from "@pnp/telemetry-js";
import { version } from './version';
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
const CONTROL_TYPE = "property";
export function track(componentName, properties = {}) {
    const telemetry = PnPTelemetry.getInstance();
    telemetry.trackEvent(componentName, Object.assign({ version, controlType: CONTROL_TYPE, debug: DEBUG ? "true" : "false", environment: EnvironmentType[Environment.type] }, properties));
}
//# sourceMappingURL=index.js.map