var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState, useEffect } from "react";
import loader from "@monaco-editor/loader";
const CDN_PATH_TO_MONACO_EDITOR = "https://cdn.jsdelivr.net/npm/monaco-editor@0.32.1/min/vs";
export var EStatus;
(function (EStatus) {
    EStatus[EStatus["LOADING"] = 0] = "LOADING";
    EStatus[EStatus["LOADED"] = 1] = "LOADED";
    EStatus[EStatus["ERROR"] = 2] = "ERROR";
})(EStatus || (EStatus = {}));
export const useMonaco = () => {
    const [monaco, setMonaco] = useState(undefined);
    const [status, setStatus] = useState(EStatus.LOADING);
    const [error, setError] = useState(undefined);
    useEffect(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                loader.config({ paths: { vs: CDN_PATH_TO_MONACO_EDITOR } });
                const monacoObj = yield loader.init();
                setStatus(EStatus.LOADED);
                setMonaco(monacoObj);
            }
            catch (error) {
                setStatus(EStatus.ERROR);
                setMonaco(undefined);
                setError(error);
            }
        }))().then(() => { }).catch(() => { });
    }, []);
    return {
        monaco,
        status,
        error,
    };
};
//# sourceMappingURL=useMonaco.js.map