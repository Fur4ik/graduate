import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SubjectsService } from '../../../shared/services/subjects.service';
import { FilesService } from '../../../shared/services/files.service';
import { TeachersService } from '../../../shared/services/teachers.service';
import { DirectionsService } from '../../../shared/services/directions.service';
import { Status } from '../../../shared/models/direction.models';
import { Teacher } from '../../../shared/models/teacher.models';
import { Subject } from '../../../shared/models/subject.models';
import { SubjectFile } from '../../../shared/models/file.models';

@Component({
  selector: 'app-direction-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    TagModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './direction-detail.component.html',
  styleUrl: './direction-detail.component.scss',
})
export class DirectionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subjectsService = inject(SubjectsService);
  private filesService = inject(FilesService);
  private teachersService = inject(TeachersService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private directionsService = inject(DirectionsService);
  private cdr = inject(ChangeDetectorRef);

  directionId = 0;
  get entry() {
    return this.directionsService.getEntry(this.directionId);
  }
  subjects = signal<Subject[]>([]);
  teachers = signal<Teacher[]>([]);
  files = signal<Record<number, SubjectFile[]>>({});
  loadingSubjects = signal(true);
  expandedRows = signal<Record<number, boolean>>({});

  statuses: Status[] = [
    { id: 1, name: 'Готово' },
    { id: 2, name: 'В процессе' },
    { id: 3, name: 'Шаблон' },
  ];

  searchQuery = signal('');
  filterTeacherId = signal<number | null>(null);
  filterStatusId = signal<number | null>(null);

  filteredSubjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const teacherId = this.filterTeacherId();
    const statusId = this.filterStatusId();
    return this.subjects().filter((s: any) => {
      const matchSearch =
        !query ||
        s.subject?.toLowerCase().includes(query) ||
        s.teacher_name?.toLowerCase().includes(query);
      const matchTeacher = !teacherId || s.teacher_id === teacherId;
      const matchStatus = !statusId || s.status_id === statusId;
      return matchSearch && matchTeacher && matchStatus;
    });
  });

  showDialog = signal(false);
  editingId = signal<number | null>(null);
  dialogSubject = {
    subject: '',
    teacherId: null as number | null,
    statusId: null as number | null,
  };

  ngOnInit(): void {
    this.directionId = parseInt(this.route.snapshot.paramMap.get('id') ?? '0');
    this.loadSubjects();
    this.teachersService.getAll().subscribe({ next: (t) => this.teachers.set(t) });
    if (this.directionsService.directions().length === 0) {
      this.directionsService.load().subscribe();
    }
  }

  loadSubjects(): void {
    this.loadingSubjects.set(true);
    this.subjectsService.getAll(this.directionId).subscribe({
      next: (data) => {
        this.subjects.set(data);
        this.loadingSubjects.set(false);
      },
      error: () => this.loadingSubjects.set(false),
    });
  }

  toggleRow(subject: Subject): void {
    const current = this.expandedRows();
    if (current[subject.id]) {
      const updated = { ...current };
      delete updated[subject.id];
      this.expandedRows.set(updated);
    } else {
      this.expandedRows.set({ ...current, [subject.id]: true });
      if (!this.files()[subject.id]) {
        this.loadFiles(subject.id);
      }
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedRows()[id];
  }

  loadFiles(subjectId: number): void {
    this.filesService.getAll(this.directionId, subjectId).subscribe({
      next: (data) => this.files.set({ ...this.files(), [subjectId]: data }),
    });
  }

  getFiles(subjectId: number): SubjectFile[] {
    return this.files()[subjectId] ?? [];
  }

  downloadUrl(subjectId: number, fileId: number): string {
    return this.filesService.downloadUrl(this.directionId, subjectId, fileId);
  }

  onFileUpload(event: Event, subjectId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.filesService.upload(this.directionId, subjectId, file).subscribe({
      next: () => {
        this.loadFiles(subjectId);
        this.messageService.add({ severity: 'success', summary: 'Файл загружен' });
        input.value = '';
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Ошибка загрузки' }),
    });
  }

  deleteFile(subjectId: number, fileId: number): void {
    this.confirmationService.confirm({
      message: 'Вы уверены, что хотите удалить файл?',
      header: 'Удаление файла',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.filesService.delete(this.directionId, subjectId, fileId).subscribe({
          next: () => {
            this.loadFiles(subjectId);
            this.messageService.add({ severity: 'success', summary: 'Файл удалён' });
          },
        });
      },
    });
  }

  openAddDialog(): void {
    this.editingId.set(null);
    this.dialogSubject = { subject: '', teacherId: null, statusId: null };
    this.showDialog.set(true);
  }

  openEditDialog(subject: any): void {
    this.editingId.set(subject.id);
    this.dialogSubject = {
      subject: subject.subject,
      teacherId: subject.teacher_id ?? null,
      statusId: subject.status_id ?? null,
    };
    this.showDialog.set(true);
  }

  saveSubject(): void {
    if (!this.dialogSubject.subject.trim()) return;
    const data = {
      subject: this.dialogSubject.subject,
      teacherId: this.dialogSubject.teacherId ?? undefined,
      statusId: this.dialogSubject.statusId ?? undefined,
    };
    const id = this.editingId();
    const request$ = id
      ? this.subjectsService.update(this.directionId, id, data)
      : this.subjectsService.create(this.directionId, data);

    request$.subscribe({
      next: () => {
        this.showDialog.set(false);
        this.loadSubjects();
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Дисциплина обновлена' : 'Дисциплина добавлена',
        });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Ошибка' }),
    });
  }

  deleteSubject(subject: Subject): void {
    this.confirmationService.confirm({
      message: `Вы уверены, что хотите удалить дисциплину «${subject.subject}»?`,
      header: 'Удаление дисциплины',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.subjectsService.delete(this.directionId, subject.id).subscribe({
          next: () => {
            this.loadSubjects();
            this.messageService.add({ severity: 'success', summary: 'Дисциплина удалена' });
          },
        });
      },
    });
  }

  getStatusSeverity(statusId: number): 'success' | 'warn' | 'secondary' {
    if (statusId === 1) return 'success';
    if (statusId === 2) return 'warn';
    return 'secondary';
  }

  onDialogHide(): void {
    this.dialogSubject = { subject: '', teacherId: null, statusId: null };
    this.editingId.set(null);
    this.cdr.detectChanges();
  }

  downloadAllSubjectUrl(subjectId: number): string {
    return this.filesService.downloadAllSubjectUrl(this.directionId, subjectId);
  }

  downloadAllDirectionUrl(): string {
    return this.filesService.downloadAllDirectionUrl(this.directionId);
  }

  reportUrl(): string {
    return this.filesService.reportUrl(this.directionId);
  }

  back(): void {
    this.router.navigate(['/']);
  }
}
