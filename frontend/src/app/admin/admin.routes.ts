import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { UserManagement } from './user-management/user-management';
import { FieldManagement } from './field-management/field-management';
import { InstitutionManagement } from './institution-management/institution-management';

export const ADMIN_ROUTES: Routes = [
    { path: '', component: Dashboard }, // Default route for admin
    { path: 'users', component: UserManagement },
    { path: 'fields', component: FieldManagement },
    { path: 'institutions', component: InstitutionManagement },
];
