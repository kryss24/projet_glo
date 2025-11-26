import { Routes } from '@angular/router';
import { UserProfile } from './user-profile/user-profile';
import { FavoriteList } from './favorite-list/favorite-list';
import { OrientationTest } from './orientation-test/orientation-test';
import { TestResult } from './test-result/test-result';
import { Dashboard } from './dashboard/dashboard'; // Import the new dashboard component

export const STUDENT_ROUTES: Routes = [
    { path: '', component: Dashboard }, // Default route for /student
    { path: 'profile', component: UserProfile },
    { path: 'favorites', component: FavoriteList },
    { path: 'test', component: OrientationTest },
    { path: 'test-result/:id', component: TestResult },
];
