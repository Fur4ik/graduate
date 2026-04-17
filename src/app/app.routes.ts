import { Routes } from '@angular/router';
import { DirectionsComponent } from './pages/directions-page/directions/directions.component';
import { DirectionDetailComponent } from './pages/directions-page/direction-detail/direction-detail.component';
import { TeachersComponent } from './pages/techers-page/teachers/teachers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'direction', pathMatch: 'full' },
  { path: 'direction', component: DirectionsComponent },
  { path: 'direction/:id', component: DirectionDetailComponent },
  { path: 'teachers', component: TeachersComponent },
];
