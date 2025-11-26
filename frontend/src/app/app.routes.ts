import { Routes } from '@angular/router';
import { Home } from './home/home';

export const routes: Routes = [
    {
        path: 'home',
        component: Home
    },
    {
        path: '',
        redirectTo: 'home', // or a default landing page
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
    },
    {
        path: 'student',
        loadChildren: () => import('./student/student.routes').then(m => m.STUDENT_ROUTES)
    },
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'catalog',
        loadChildren: () => import('./catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
    },
    // Wildcard route for a 404 page
    {
        path: '**',
        redirectTo: 'home' // Redirect to home for now, can be a 404 component
    }
];
