import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DirectionsService } from '../../../shared/services/directions.service';
import { DirectionCardListComponent } from '../components/direction-card-list/direction-card-list.component';

@Component({
  selector: 'app-directions',
  standalone: true,
  imports: [ProgressSpinnerModule, DirectionCardListComponent],
  templateUrl: './directions.component.html',
  styleUrl: './directions.component.scss',
})
export class DirectionsComponent implements OnInit {
  private router = inject(Router);
  readonly directionsService = inject(DirectionsService);

  loading = signal(true);

  bachelor = this.directionsService.bachelor;
  master = this.directionsService.master;

  ngOnInit(): void {
    this.directionsService.load().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  open(alias: string): void {
    this.router.navigate(['/direction', alias]);
  }
}
