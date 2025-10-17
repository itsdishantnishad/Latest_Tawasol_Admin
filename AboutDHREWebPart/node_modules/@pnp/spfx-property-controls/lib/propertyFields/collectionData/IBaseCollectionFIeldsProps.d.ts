import { ICustomCollectionField } from './ICustomCollectionField';
export interface IBaseCollectionFieldProps {
    field: ICustomCollectionField;
    item: any;
    disableEdit: boolean;
    fOnValueChange: (fieldId: string, value: any) => void | Promise<void>;
    fValidation: (field: ICustomCollectionField, value: any) => Promise<string>;
}
//# sourceMappingURL=IBaseCollectionFIeldsProps.d.ts.map