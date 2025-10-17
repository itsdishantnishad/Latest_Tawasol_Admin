import { findIndex } from '@microsoft/sp-lodash-subset';
/**
 * Helper class with some methods that can be used in any Term Store Picker Service implementation
 */
export class TermStorePickerServiceHelper {
    /**
     * Cleans the Guid from the Web Service response
     * @param guid
     */
    static cleanGuid(guid) {
        if (guid !== undefined) {
            return guid.replace('/Guid(', '').replace('/', '').replace(')', '');
        }
        else {
            return '';
        }
    }
    /**
     * Checks if the provided string is a GUID
     * @param strGuid string to check
     */
    static isGuid(strGuid) {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(strGuid);
    }
    /**
     * Sorting terms based on their path and depth
     *
     * @param terms
     */
    static sortTerms(terms) {
        // Start sorting by depth
        let newTermsOrder = [];
        let itemsToSort = true;
        let pathLevel = 1;
        while (itemsToSort) {
            // Get terms for the current level
            let crntTerms = terms.filter(term => term.PathDepth === pathLevel);
            if (crntTerms && crntTerms.length > 0) {
                crntTerms = crntTerms.sort(this.sortTermByPath);
                if (pathLevel !== 1) {
                    crntTerms = crntTerms.reverse();
                    for (const crntTerm of crntTerms) {
                        const pathElms = crntTerm.PathOfTerm.split(";");
                        // Last item is not needed for parent path
                        pathElms.pop();
                        // Find the parent item and add the new item
                        const idx = findIndex(newTermsOrder, term => term.PathOfTerm === pathElms.join(";"));
                        if (idx !== -1) {
                            newTermsOrder.splice(idx + 1, 0, crntTerm);
                        }
                        else {
                            // Push the item at the end if the parent couldn't be found
                            newTermsOrder.push(crntTerm);
                        }
                    }
                }
                else {
                    newTermsOrder = crntTerms;
                }
                ++pathLevel;
            }
            else {
                itemsToSort = false;
            }
        }
        return newTermsOrder;
    }
    /**
     * Sort the terms by their path
     *
     * @param a term 2
     * @param b term 2
     */
    static sortTermByPath(a, b) {
        if (a.PathOfTerm < b.PathOfTerm) {
            return -1;
        }
        if (a.PathOfTerm > b.PathOfTerm) {
            return 1;
        }
        return 0;
    }
}
//# sourceMappingURL=ISPTermStorePickerService.js.map