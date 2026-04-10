import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-directions',
  standalone: true,
  imports: [CardModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './directions.component.html',
  styleUrl: './directions.component.scss',
})
export class DirectionsComponent implements OnInit {
  tables = signal<string[]>([]);
  loading = signal(true);

  constructor(
    private subjectsService: SubjectsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subjectsService.getTables().subscribe({
      next: (data) => {
        this.tables.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  open(table: string): void {
    this.router.navigate(['/direction', encodeURIComponent(table)]);
  }
}
