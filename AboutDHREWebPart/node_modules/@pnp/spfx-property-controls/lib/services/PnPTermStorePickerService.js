var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TermStorePickerServiceHelper } from "./ISPTermStorePickerService";
import { taxonomy, StringMatchOption } from "@pnp/sp-taxonomy";
/**
 * Term Store Picker Service implementation that uses @pnp/sp-taxonomy to work with taxonomy service
 */
export default class PnPTermStorePickerService {
    constructor(props, context) {
        this.props = props;
        this.context = context;
        this._termSetCollectionObjectType = 'SP.Taxonomy.TermSetCollection';
        this._termGroupCollectionObjectType = 'SP.Taxonomy.TermGroupCollection';
        this._pnpGroups = {};
        taxonomy.setup({
            spfxContext: context
            //globalCacheDisable: true // uncomment this one for debugging with no cache
        });
    }
    /**
     * Gets term stores from the taxonomy service
     */
    getTermStores() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._ensureTermStores();
            const result = [];
            this._pnpTermStores.forEach(pnpTermStore => {
                result.push({
                    _ObjectType_: 'SP.Taxonomy.TermStore',
                    _ObjectIdentity_: pnpTermStore._ObjectIdentity_, // eslint-disable-line @typescript-eslint/no-explicit-any
                    Id: pnpTermStore.Id,
                    Name: pnpTermStore.Name,
                    Groups: {
                        _ObjectType_: this._termGroupCollectionObjectType,
                        _Child_Items_: this._pnpGroups[pnpTermStore.Id].map(g => {
                            return this._pnpTermGroup2TermGroup(g, pnpTermStore);
                        })
                    }
                });
            });
            return result;
        });
    }
    /**
     * Searches terms by provided text
     * @param searchText text to search
     */
    searchTermsByName(searchText) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.props.limitByTermsetNameOrID) { // search in specific term(s)
                return this._searchTermsByTermSet(searchText);
            }
            else if (this.props.limitByGroupNameOrID) { // search in specific group
                return this._searchTermsByGroup(searchText);
            }
            else { // search everywhere
                return this._searchAllTerms(searchText);
            }
        });
    }
    /**
     * Gets term sets from the stores
     */
    getTermSets() {
        return __awaiter(this, void 0, void 0, function* () {
            let termSets = [];
            yield this._ensureTermStores();
            for (let i = 0, len = this._pnpTermStores.length; i < len; i++) {
                const pnpTermStore = this._pnpTermStores[i];
                if (this.props.limitByTermsetNameOrID) {
                    const pnpTermSets = yield this._getPnPTermSetsByNameOrId(pnpTermStore, this.props.limitByTermsetNameOrID);
                    const groupsBatch = taxonomy.createBatch();
                    for (let termSetIdx = 0, termSetLen = pnpTermSets.length; termSetIdx < termSetLen; termSetIdx++) {
                        const pnpTermSet = pnpTermSets[termSetIdx];
                        const termSet = this._pnpTermSet2TermSet(pnpTermSet, '');
                        termSets.push(termSet);
                        pnpTermSet.group.inBatch(groupsBatch).usingCaching().get().then(pnpTermGroup => {
                            termSet.Group = TermStorePickerServiceHelper.cleanGuid(pnpTermGroup.Id);
                        }).catch(() => { });
                    }
                    yield groupsBatch.execute();
                }
                else {
                    let pnpGroups;
                    if (this.props.limitByGroupNameOrID) {
                        const pnpGroup = this._getPnPTermGroupsByNameOrId(pnpTermStore.Id, this.props.limitByGroupNameOrID);
                        pnpGroups = [];
                        if (pnpGroup) {
                            pnpGroups.push(pnpGroup);
                        }
                    }
                    else {
                        pnpGroups = this._pnpGroups[pnpTermStore.Id];
                    }
                    const batch = taxonomy.createBatch();
                    pnpGroups.forEach(pnpGroup => {
                        pnpGroup.termSets.inBatch(batch).usingCaching().get().then(pnpTermSets => {
                            termSets = [...termSets, ...pnpTermSets.map(pnpTermSet => {
                                    return this._pnpTermSet2TermSet(pnpTermSet, TermStorePickerServiceHelper.cleanGuid(pnpGroup.Id));
                                })];
                        }).catch(() => { });
                    });
                    yield batch.execute();
                }
            }
            return termSets;
        });
    }
    /**
     * Gets all terms from the specified term set
     * @param termSet Term Set to get terms from
     */
    getAllTerms(termSet) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._ensureTermStores();
            const pnpTermStores = this._pnpTermStores;
            for (const pnpTermStore of pnpTermStores) {
                const termsResult = yield this._tryGetAllTerms(pnpTermStore, termSet).catch((error) => { }); // .catch part is needed to proceed if there was a rejected promise
                if (!termsResult) { // terms variable will be undefined if the Promise has been rejected. Otherwise it will contain an array
                    continue;
                }
                const pnpTerms = termsResult;
                const resultTerms = [];
                const labelsBatch = taxonomy.createBatch();
                for (let termIdx = 0, termsLen = pnpTerms.length; termIdx < termsLen; termIdx++) {
                    const pnpTerm = pnpTerms[termIdx];
                    const term = pnpTerm;
                    term.Id = TermStorePickerServiceHelper.cleanGuid(term.Id);
                    term.PathDepth = term.PathOfTerm.split(';').length;
                    term.TermSet = termSet;
                    resultTerms.push(term);
                    if (this.props.includeLabels) {
                        pnpTerm.labels.inBatch(labelsBatch).usingCaching().get().then(labels => {
                            term.Labels = labels.map(label => label.Value);
                        }).catch(() => { });
                    }
                }
                if (this.props.includeLabels) {
                    yield labelsBatch.execute();
                }
                return TermStorePickerServiceHelper.sortTerms(resultTerms);
            }
        });
    }
    /**
     * Get term sets from the specified group
     * @param group Term Group
     */
    getGroupTermSets(group) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._ensureTermStores();
            const pnpTermStore = this._pnpTermStores.filter(ts => TermStorePickerServiceHelper.cleanGuid(ts.Id) === group.TermStore.Id)[0];
            const pnpGroups = this._pnpGroups[pnpTermStore.Id].filter(gr => TermStorePickerServiceHelper.cleanGuid(gr.Id) === group.Id); //await pnpTermStore.getTermGroupById(group.Id).usingCaching().get();
            if (!pnpGroups || !pnpGroups.length) {
                return {
                    _ObjectType_: this._termSetCollectionObjectType,
                    _Child_Items_: []
                };
            }
            const pnpGroup = pnpGroups[0];
            let pnpTermSets;
            if (this.props.limitByTermsetNameOrID) {
                const isGuid = TermStorePickerServiceHelper.isGuid(this.props.limitByTermsetNameOrID);
                if (isGuid) {
                    pnpTermSets = [yield pnpGroup.termSets.getById(this.props.limitByTermsetNameOrID).usingCaching().get()];
                }
                else {
                    pnpTermSets = [yield pnpGroup.termSets.getByName(this.props.limitByTermsetNameOrID).usingCaching().get()];
                }
            }
            else {
                pnpTermSets = yield pnpGroup.termSets.usingCaching().get();
            }
            const result = {
                _ObjectType_: this._termSetCollectionObjectType,
                _Child_Items_: pnpTermSets.map(pnpTermSet => {
                    return this._pnpTermSet2TermSet(pnpTermSet, TermStorePickerServiceHelper.cleanGuid(pnpGroup.Id));
                })
            };
            return result;
        });
    }
    /**
     * Tries to get terms from the specified Term Set.
     * @param pnpTermStore Term Store to work with
     * @param termSet Term set to get terms from
     */
    _tryGetAllTerms(pnpTermStore, termSet) {
        return new Promise((resolve, reject) => {
            pnpTermStore.getTermSetById(termSet.Id).terms.usingCaching().get().then((pnpTerms) => {
                resolve(pnpTerms);
            }, (error) => {
                reject(error);
            });
        });
    }
    /**
     * Searches terms by provided text in the term sets specified by the this.props.limitByTermSetNameOrId
     * @param searchText text to search
     */
    _searchTermsByTermSet(searchText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._ensureTermStores();
            const returnTerms = [];
            const pnpTermStores = this._pnpTermStores;
            //
            // iterating through term stores
            //
            for (let i = 0, len = pnpTermStores.length; i < len; i++) {
                const pnpTermStore = pnpTermStores[i];
                const pnpTermSets = yield this._getPnPTermSetsByNameOrId(pnpTermStore, this.props.limitByTermsetNameOrID);
                // getting filtered terms from term sets
                returnTerms.push(...yield this._searchTermsInTermSets(pnpTermStore, pnpTermSets, searchText));
            }
            return returnTerms;
        });
    }
    /**
     * Searches terms by provided text in the term sets specified by the this.props.limitByGroupNameOrId
     * @param searchText text to search
     */
    _searchTermsByGroup(searchText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._ensureTermStores();
            const groupNameOrID = this.props.limitByGroupNameOrID;
            const returnTerms = [];
            const pnpTermStores = this._pnpTermStores;
            //
            // iterating through term stores
            //
            for (let i = 0, len = pnpTermStores.length; i < len; i++) {
                const pnpTermStore = pnpTermStores[i];
                const pnpGroup = this._getPnPTermGroupsByNameOrId(pnpTermStore.Id, groupNameOrID);
                if (!pnpGroup) {
                    continue;
                }
                // getting term sets from term group
                const pnpTermSets = yield pnpGroup.termSets.usingCaching().get();
                // getting filtered terms from term sets
                returnTerms.push(...yield this._searchTermsInTermSets(pnpTermStore, pnpTermSets, searchText, pnpGroup.Id));
            }
            return returnTerms;
        });
    }
    /**
     * Searches for terms in the term store
     * @param searchText text to search
     */
    _searchAllTerms(searchText) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._ensureTermStores();
            const pnpTermStores = this._pnpTermStores;
            const returnTerms = [];
            //
            // iterating through term stores
            //
            for (let i = 0, len = pnpTermStores.length; i < len; i++) {
                const pnpTermStore = pnpTermStores[i];
                // searching for terms that starts with provided string
                const pnpTerms = yield pnpTermStore.getTerms({
                    TermLabel: searchText,
                    StringMatchOption: StringMatchOption.StartsWith,
                    DefaultLabelOnly: true,
                    TrimUnavailable: true,
                    ResultCollectionSize: 30
                }).usingCaching().get();
                const batch = taxonomy.createBatch();
                //
                // processing each term to get termSet info and labels
                //
                pnpTerms.forEach(pnpTerm => {
                    const pickerTerm = {
                        key: TermStorePickerServiceHelper.cleanGuid(pnpTerm.Id),
                        name: pnpTerm.Name,
                        path: pnpTerm.PathOfTerm,
                        termSet: '',
                        termGroup: ''
                    };
                    returnTerms.push(pickerTerm);
                    pnpTerm.termSet.group.inBatch(batch).usingCaching().get().then(pnpTermGroup => {
                        pickerTerm.termGroup = TermStorePickerServiceHelper.cleanGuid(pnpTermGroup.Id);
                    }).catch(() => { });
                    pnpTerm.termSet.inBatch(batch).usingCaching().get().then(pnpTermSet => {
                        pickerTerm.termSet = TermStorePickerServiceHelper.cleanGuid(pnpTermSet.Id);
                        pickerTerm.termSetName = pnpTermSet.Name;
                    }).catch(() => { });
                    if (this.props.includeLabels) {
                        pnpTerm.labels.inBatch(batch).usingCaching().get().then(labels => {
                            pickerTerm.labels = labels.map(label => label.Value);
                        }).catch(() => { });
                    }
                });
                yield batch.execute();
            }
            return returnTerms;
        });
    }
    /**
     * Searches for terms by provided text in specified term sets
     * @param pnpTermStore Term Store
     * @param pnpTermSets term sets where the terms should be searched for
     * @param searchText text to search
     * @param termGroupId Id of the group that contains the term sets
     */
    _searchTermsInTermSets(pnpTermStore, pnpTermSets, searchText, termGroupId) {
        return __awaiter(this, void 0, void 0, function* () {
            const returnTerms = [];
            const termSetGroups = {};
            const termsBatch = taxonomy.createBatch();
            const labelsBatch = taxonomy.createBatch();
            const lowerCasedSearchText = searchText.toLowerCase();
            for (let termSetIdx = 0, termSetLen = pnpTermSets.length; termSetIdx < termSetLen; termSetIdx++) {
                const pnpTermSet = pnpTermSets[termSetIdx];
                const pnpTermSetGuid = TermStorePickerServiceHelper.cleanGuid(pnpTermSet.Id);
                if (!termGroupId) { // if no group id provided we need to load it from store
                    pnpTermSet.group.inBatch(termsBatch).usingCaching().get().then(pnpTermGroup => {
                        termSetGroups[pnpTermSet.Id] = pnpTermGroup.Id;
                        const loadedTerms = returnTerms.filter(t => t.termSet === pnpTermSetGuid);
                        loadedTerms.forEach(t => {
                            t.termGroup = TermStorePickerServiceHelper.cleanGuid(pnpTermGroup.Id);
                        });
                    }).catch(() => { });
                }
                // getting terms for term set in batch
                pnpTermSet.terms.inBatch(termsBatch).usingCaching().get().then(pnpTerms => {
                    for (let termIdx = 0, termLen = pnpTerms.length; termIdx < termLen; termIdx++) {
                        const pnpTerm = pnpTerms[termIdx];
                        if (pnpTerm.Name.toLowerCase().indexOf(lowerCasedSearchText) === 0) {
                            const pickerTerm = {
                                key: TermStorePickerServiceHelper.cleanGuid(pnpTerm.Id),
                                name: pnpTerm.Name,
                                path: pnpTerm.PathOfTerm,
                                termSet: TermStorePickerServiceHelper.cleanGuid(pnpTermSetGuid),
                                termSetName: pnpTermSet.Name,
                                termGroup: termGroupId || TermStorePickerServiceHelper.cleanGuid(termSetGroups[pnpTermSet.Id])
                            };
                            returnTerms.push(pickerTerm);
                            // getting labels for each term in a separate batch
                            if (this.props.includeLabels) {
                                pnpTerm.labels.inBatch(labelsBatch).usingCaching().get().then(pnpLabels => {
                                    pickerTerm.labels = pnpLabels.map(l => l.Value);
                                }).catch(() => { });
                            }
                        }
                    }
                }).catch(() => { });
            }
            //
            // executing batches
            //
            yield termsBatch.execute();
            if (this.props.includeLabels) {
                yield labelsBatch.execute();
            }
            return returnTerms;
        });
    }
    /**
     * Ensures (loads if needed) term stores and term groups from taxonomy service
     */
    _ensureTermStores() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._pnpTermStores) {
                this._pnpTermStores = yield taxonomy.termStores.usingCaching().get();
                // TODO: limit by group or termset
                for (let i = 0, len = this._pnpTermStores.length; i < len; i++) {
                    const pnpTermStore = this._pnpTermStores[i];
                    let pnpGroups;
                    if (this.props.limitByGroupNameOrID) {
                        const group = yield this._requestPnPTermGroupByNameOrId(pnpTermStore, this.props.limitByGroupNameOrID);
                        pnpGroups = [];
                        if (group) {
                            pnpGroups.push(group);
                        }
                    }
                    else if (this.props.limitByTermsetNameOrID) {
                        const pnpTermSets = yield this._getPnPTermSetsByNameOrId(pnpTermStore, this.props.limitByTermsetNameOrID);
                        pnpGroups = [];
                        const groupsBatch = taxonomy.createBatch();
                        pnpTermSets.forEach(pnpTermSet => {
                            pnpTermSet.group.inBatch(groupsBatch).usingCaching().get().then(pnpGroup => {
                                if (!pnpGroups.filter(gr => gr.Id === pnpGroup.Id).length) {
                                    pnpGroups.push(pnpGroup);
                                }
                            }).catch(() => { });
                        });
                        yield groupsBatch.execute();
                    }
                    else {
                        pnpGroups = yield pnpTermStore.groups.usingCaching().get();
                    }
                    this._pnpGroups[pnpTermStore.Id] = pnpGroups;
                }
            }
        });
    }
    /**
     * Converts @pnp/sp-taxonomy Term Set instance into internal ITermSet object
     * @param pnpTermSet @pnp/sp-taxonomy Term Set instance
     * @param groupId Id of the group that contains the term set
     */
    _pnpTermSet2TermSet(pnpTermSet, groupId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPnPTermSet = pnpTermSet; // we need this one to reference _ObjectType_ and _ObjectIdentity_
        return {
            _ObjectType_: anyPnPTermSet._ObjectType_,
            _ObjectIdentity_: anyPnPTermSet._ObjectIdentity_,
            Id: TermStorePickerServiceHelper.cleanGuid(pnpTermSet.Id),
            Name: pnpTermSet.Name,
            Description: pnpTermSet.Description,
            Names: pnpTermSet.Names,
            Group: groupId
        };
    }
    /**
     * Converts @pnp/sp-taxonomy Term Group instance into internal IGroup object
     * @param pnpTermGroup @pnp/sp-taxonomy Term Group instance
     * @param pnpTermStore @pnp/sp-taxonumy term store to work with
     */
    _pnpTermGroup2TermGroup(pnpTermGroup, pnpTermStore) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyPnPTermGroup = pnpTermGroup; // we need this one to reference _ObjectType_ and _ObjectIdentity_
        return {
            _ObjectType_: anyPnPTermGroup._ObjectType_,
            _ObjectIdentity_: anyPnPTermGroup._ObjectIdentity_,
            Id: TermStorePickerServiceHelper.cleanGuid(pnpTermGroup.Id),
            Name: pnpTermGroup.Name,
            IsSystemGroup: pnpTermGroup.IsSystemGroup,
            TermStore: {
                Id: TermStorePickerServiceHelper.cleanGuid(pnpTermStore.Id),
                Name: pnpTermStore.Name
            },
            TermSets: {
                _ObjectType_: this._termSetCollectionObjectType,
                _Child_Items_: null
            }
        };
    }
    /**
     * Gets term set(s) from taxonomy service by name or id
     * @param pnpTermStore @pnp/sp-taxonumy term store to work with
     * @param termSetNameOrID term set name or id
     */
    _getPnPTermSetsByNameOrId(pnpTermStore, termSetNameOrID) {
        return __awaiter(this, void 0, void 0, function* () {
            let pnpTermSets;
            const isGuid = TermStorePickerServiceHelper.isGuid(termSetNameOrID);
            //
            // getting term sets by filter
            //
            if (isGuid) {
                pnpTermSets = [];
                const pnpTermSet = yield pnpTermStore.getTermSetById(termSetNameOrID).usingCaching().get();
                if (pnpTermSet.Id) {
                    pnpTermSets.push(pnpTermSet);
                }
            }
            else {
                pnpTermSets = yield pnpTermStore.getTermSetsByName(termSetNameOrID, pnpTermStore.DefaultLanguage).usingCaching().get();
            }
            return pnpTermSets;
        });
    }
    /**
     * Gets group from cached (previously loaded) list of groups by name or id
     * @param termStoreId term store id
     * @param groupNameOrID group name or id
     */
    _getPnPTermGroupsByNameOrId(termStoreId, groupNameOrID) {
        const isGuid = TermStorePickerServiceHelper.isGuid(groupNameOrID);
        const pnpTermStoreGroups = this._pnpGroups[termStoreId];
        if (pnpTermStoreGroups) {
            const groups = pnpTermStoreGroups.filter(pnpGroup => isGuid ? TermStorePickerServiceHelper.cleanGuid(pnpGroup.Id) === groupNameOrID
                : pnpGroup.Name === groupNameOrID);
            if (groups && groups.length) {
                return groups[0];
            }
        }
        return null;
    }
    /**
     * Gets group from taxonomy service by name or id
     * @param pnpTermStore @pnp/sp-taxonomy term store to work with
     * @param groupNameOrID group name or id
     */
    _requestPnPTermGroupByNameOrId(pnpTermStore, groupNameOrID) {
        return __awaiter(this, void 0, void 0, function* () {
            const isGuid = TermStorePickerServiceHelper.isGuid(groupNameOrID);
            let group;
            if (isGuid) {
                group = yield pnpTermStore.getTermGroupById(groupNameOrID).usingCaching().get();
            }
            else {
                group = yield pnpTermStore.groups.getByName(groupNameOrID).usingCaching().get();
            }
            if (group.Id) {
                return group;
            }
            return null;
        });
    }
}
//# sourceMappingURL=PnPTermStorePickerService.js.map