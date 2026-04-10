import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SubjectsService } from '../services/subjects.service';
import {
  getDirectionLabel,
  getDirectionEntry,
  BACHELOR_DIRECTIONS,
  MASTER_DIRECTIONS,
} from '../services/directions';

@Component({
  selector: 'app-directions',
  standalone: true,
  imports: [ProgressSpinnerModule],
  templateUrl: './directions.component.html',
  styleUrl: './directions.component.scss',
})
export class DirectionsComponent implements OnInit {
  private subjectsService = inject(SubjectsService);
  private router = inject(Router);

  tables = signal<string[]>([]);
  loading = signal(true);

  bachelor = computed(() => this.tables().filter((t) => t in BACHELOR_DIRECTIONS));
  master = computed(() => this.tables().filter((t) => t in MASTER_DIRECTIONS));

  ngOnInit(): void {
    this.subjectsService.getTables().subscribe({
      next: (data) => {
        this.tables.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getLabel = getDirectionLabel;
  getEntry = getDirectionEntry;

  open(table: string): void {
    this.router.navigate(['/direction', encodeURIComponent(table)]);
  }
}
