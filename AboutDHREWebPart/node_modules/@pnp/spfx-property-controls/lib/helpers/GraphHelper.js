var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const RequestsPerBatch = 10;
export function batch(batchRequestItems, version, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestsCount = batchRequestItems.length;
        const batchesCount = Math.ceil(requestsCount / RequestsPerBatch);
        let batchIndex = 0;
        const result = [];
        const client = yield getGraphClient(context);
        while (batchIndex < batchesCount) {
            const start = batchIndex * RequestsPerBatch;
            let end = start + RequestsPerBatch;
            if (end > requestsCount) {
                end = requestsCount;
            }
            const response = yield client.api('/$batch').version(version).post({
                requests: batchRequestItems.slice(start, end)
            });
            result.push(...response.responses);
            batchIndex++;
        }
        return result;
    });
}
export function getGraphClient(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield context.msGraphClientFactory.getClient('3');
        return client;
    });
}
//# sourceMappingURL=GraphHelper.js.map