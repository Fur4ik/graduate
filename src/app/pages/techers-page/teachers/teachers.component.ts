import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TeachersService } from '../../../shared/services/teachers.service';
import { DirectionsService } from '../../../shared/services/directions.service';
import { Teacher, TeacherSubject } from '../../../shared/models/teacher.models';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TagModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './teachers.component.html',
  styleUrl: './teachers.component.scss',
})
export class TeachersComponent implements OnInit {
  private teachersService = inject(TeachersService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private directionsService = inject(DirectionsService);

  teachers = signal<Teacher[]>([]);
  loading = signal(true);
  expandedRows = signal<Record<number, boolean>>({});
  subjectsMap = signal<Record<number, TeacherSubject[]>>({});

  showDialog = signal(false);
  editingId = signal<number | null>(null);
  dialogTeacher = { name: '', email: '' };

  ngOnInit(): void {
    this.load();
    if (this.directionsService.directions().length === 0) {
      this.directionsService.load().subscribe();
    }
  }

  load(): void {
    this.loading.set(true);
    this.teachersService.getAll().subscribe({
      next: (data) => {
        this.teachers.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleRow(teacher: Teacher): void {
    const current = this.expandedRows();
    if (current[teacher.id]) {
      const updated = { ...current };
      delete updated[teacher.id];
      this.expandedRows.set(updated);
    } else {
      this.expandedRows.set({ ...current, [teacher.id]: true });
      if (!this.subjectsMap()[teacher.id]) {
        this.loadSubjects(teacher.id);
      }
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedRows()[id] ?? false;
  }

  loadSubjects(teacherId: number): void {
    this.teachersService.getSubjects(teacherId).subscribe({
      next: (data) => this.subjectsMap.set({ ...this.subjectsMap(), [teacherId]: data }),
    });
  }

  getSubjects(teacherId: number): TeacherSubject[] {
    return this.subjectsMap()[teacherId] ?? [];
  }

  groupByDirection(
    subjects: TeacherSubject[],
  ): { direction: string; profile: string; items: TeacherSubject[] }[] {
    const map = new Map<number, TeacherSubject[]>();
    for (const s of subjects) {
      const list = map.get(s.direction_id) ?? [];
      list.push(s);
      map.set(s.direction_id, list);
    }
    return Array.from(map.entries()).map(([directionId, items]) => {
      const entry = this.directionsService.getEntry(directionId);
      return { direction: `${entry.code} ${entry.direction}`, profile: entry.profile, items };
    });
  }

  openAddDialog(): void {
    this.editingId.set(null);
    this.dialogTeacher = { name: '', email: '' };
    this.showDialog.set(true);
  }

  openEditDialog(teacher: Teacher): void {
    this.editingId.set(teacher.id);
    this.dialogTeacher = { name: teacher.name, email: teacher.email ?? '' };
    this.showDialog.set(true);
  }

  save(): void {
    if (!this.dialogTeacher.name.trim()) return;
    const data = {
      name: this.dialogTeacher.name.trim(),
      email: this.dialogTeacher.email.trim() || undefined,
    };
    const id = this.editingId();
    const request$ = id ? this.teachersService.update(id, data) : this.teachersService.create(data);

    request$.subscribe({
      next: () => {
        this.showDialog.set(false);
        this.load();
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Преподаватель обновлён' : 'Преподаватель добавлен',
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Ошибка' }),
    });
  }

  delete(teacher: Teacher): void {
    this.confirmationService.confirm({
      message: `Удалить преподавателя «${teacher.name}»?`,
      header: 'Удаление преподавателя',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.teachersService.delete(teacher.id).subscribe({
          next: () => {
            this.load();
            this.messageService.add({ severity: 'success', summary: 'Преподаватель удалён' });
          },
        });
      },
    });
  }
}
