import { Routes } from '@angular/router';
import { FieldList } from './field-list/field-list';
import { FieldDetail } from './field-detail/field-detail';

export const CATALOG_ROUTES: Routes = [
    { path: '', component: FieldList }, // Default route for catalog
    { path: ':id', component: FieldDetail },
];
