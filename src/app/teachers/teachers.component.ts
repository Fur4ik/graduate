import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TeachersService, Teacher } from '../services/teachers.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, IconFieldModule, InputIconModule],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.scss',
})
export class TeachersComponent implements OnInit {
  teachers = signal<Teacher[]>([]);
  loading = signal(true);

  constructor(private teachersService: TeachersService) {}

  ngOnInit(): void {
    this.teachersService.getAll().subscribe({
      next: (data) => {
        this.teachers.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
