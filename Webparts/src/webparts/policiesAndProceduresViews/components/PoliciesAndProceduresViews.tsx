import * as React from 'react';
import type { IPoliciesAndProceduresViewsProps } from './IPoliciesAndProceduresViewsProps';
import GlobalBreadcrumbs from '../../assets/GlobalBreadcrumbs';
export default class PoliciesAndProceduresViews extends React.Component<IPoliciesAndProceduresViewsProps, {}> {
  public render(): React.ReactElement<IPoliciesAndProceduresViewsProps> {
   return(
   <>
   <GlobalBreadcrumbs/>
   <h1>Policies and Procedured WebPart Component</h1>
   </>
   )
  }
}
