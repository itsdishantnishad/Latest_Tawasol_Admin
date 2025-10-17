import Icons from '@uifabric/icons/lib/data/AllIconNames.json';
const icons = Icons.slice(1);
export class FluentIconsService {
    constructor() {
        this.getAll = () => {
            return this._iconNames;
        };
        this.search = (query, startsWith) => {
            const lowerCasedQuery = query.toLowerCase();
            return this._iconNames.filter(name => startsWith === false ? name.toLowerCase().indexOf(lowerCasedQuery) !== -1 : name.toLowerCase().indexOf(query) === 0);
        };
        this._iconNames = icons.map(icon => icon.name).sort();
    }
}
//# sourceMappingURL=FluentIconsService.js.map