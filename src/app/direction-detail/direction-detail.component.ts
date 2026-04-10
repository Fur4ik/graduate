import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SubjectsService, Subject } from '../services/subjects.service';
import { FilesService, SubjectFile } from '../services/files.service';
import { TeachersService, Teacher } from '../services/teachers.service';

interface Status { id: number; name: string; }

@Component({
  selector: 'app-direction-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    SelectModule, TagModule, ProgressSpinnerModule,
    ConfirmDialogModule, ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './direction-detail.component.html',
})
export class DirectionDetailComponent implements OnInit {
  table = '';
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

  // Диалог добавления предмета
  showAddDialog = signal(false);
  newSubject = { subject: '', teacherId: null as number | null, statusId: null as number | null };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectsService: SubjectsService,
    private filesService: FilesService,
    private teachersService: TeachersService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.table = decodeURIComponent(this.route.snapshot.paramMap.get('table') ?? '');
    this.loadSubjects();
    this.teachersService.getAll().subscribe({ next: (t) => this.teachers.set(t) });
  }

  loadSubjects(): void {
    this.loadingSubjects.set(true);
    this.subjectsService.getAll(this.table).subscribe({
      next: (data) => { this.subjects.set(data); this.loadingSubjects.set(false); },
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
    return !!this.expandedRows()[id];
  }

  loadFiles(subjectId: number): void {
    this.filesService.getAll(this.table, subjectId).subscribe({
      next: (data) => this.files.set({ ...this.files(), [subjectId]: data }),
    });
  }

  getFiles(subjectId: number): SubjectFile[] {
    return this.files()[subjectId] ?? [];
  }

  downloadUrl(subjectId: number, fileId: number): string {
    return this.filesService.downloadUrl(this.table, subjectId, fileId);
  }

  onFileUpload(event: Event, subjectId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.filesService.upload(this.table, subjectId, file).subscribe({
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
      message: 'Удалить файл?',
      accept: () => {
        this.filesService.delete(this.table, subjectId, fileId).subscribe({
          next: () => {
            this.loadFiles(subjectId);
            this.messageService.add({ severity: 'success', summary: 'Файл удалён' });
          },
        });
      },
    });
  }

  addSubject(): void {
    if (!this.newSubject.subject.trim()) return;
    this.subjectsService.create(this.table, {
      subject: this.newSubject.subject,
      teacherId: this.newSubject.teacherId ?? undefined,
      statusId: this.newSubject.statusId ?? undefined,
    }).subscribe({
      next: () => {
        this.showAddDialog.set(false);
        this.newSubject = { subject: '', teacherId: null, statusId: null };
        this.loadSubjects();
        this.messageService.add({ severity: 'success', summary: 'Предмет добавлен' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Ошибка' }),
    });
  }

  deleteSubject(subject: Subject): void {
    this.confirmationService.confirm({
      message: `Удалить предмет «${subject.subject}»?`,
      accept: () => {
        this.subjectsService.delete(this.table, subject.id).subscribe({
          next: () => {
            this.loadSubjects();
            this.messageService.add({ severity: 'success', summary: 'Предмет удалён' });
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

  back(): void {
    this.router.navigate(['/']);
  }
}
