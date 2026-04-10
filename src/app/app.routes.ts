import { Routes } from '@angular/router';
import { DirectionsComponent } from './directions/directions.component';
import { DirectionDetailComponent } from './direction-detail/direction-detail.component';

export const routes: Routes = [
  { path: '', component: DirectionsComponent },
  { path: 'direction/:table', component: DirectionDetailComponent },
];
