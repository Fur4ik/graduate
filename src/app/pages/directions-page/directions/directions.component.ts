import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { DirectionsService } from '../../../shared/services/directions.service';
import { DirectionCardListComponent } from '../components/direction-card-list/direction-card-list.component';
import {
  DegreeLevel,
  DirectionEntry,
  DirectionForm,
} from '../../../shared/models/direction.models';
import { emptyDirectionForm } from '../../../shared/functions/direction-function';

@Component({
  selector: 'app-directions',
  standalone: true,
  imports: [
    KeyValuePipe,
    ProgressSpinnerModule,
    DirectionCardListComponent,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './directions.component.html',
  styleUrl: './directions.component.scss',
})
export class DirectionsComponent implements OnInit {
  private router = inject(Router);
  private directionsService = inject(DirectionsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(true);
  showDirectionDialog = signal(false);
  showDegreeLevelDialog = signal(false);
  editingAlias = signal<string | null>(null);

  grouped = this.directionsService.grouped;
  degreeLevels = this.directionsService.degreeLevels;

  directionForm: DirectionForm = emptyDirectionForm();
  newDegreeLevelName = '';

  readonly keepOrder = () => 0;

  ngOnInit(): void {
    forkJoin([this.directionsService.load(), this.directionsService.loadDegreeLevels()]).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  open(alias: string): void {
    this.router.navigate(['/direction', alias]);
  }

  openAddDialog(): void {
    this.editingAlias.set(null);
    this.directionForm = emptyDirectionForm();
    this.showDirectionDialog.set(true);
  }

  openEditDialog(direction: DirectionEntry): void {
    this.editingAlias.set(direction.alias);
    this.directionForm = {
      degreeLevelId: direction.degree_level_id,
      code: direction.code,
      name: direction.direction,
      profile: direction.profile,
    };
    this.showDirectionDialog.set(true);
  }

  saveDirection(): void {
    const f = this.directionForm;
    if (!f.degreeLevelId || !f.code || !f.name || !f.profile) {
      this.messageService.add({ severity: 'warn', summary: 'Заполните все поля' });
      return;
    }

    const alias = this.editingAlias();
    const obs = alias
      ? this.directionsService.updateDirection(alias, f)
      : this.directionsService.createDirection(f);

    obs.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: alias ? 'Направление обновлено' : 'Направление добавлено',
        });
        this.showDirectionDialog.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Ошибка сохранения' });
      },
    });
  }

  deleteDirection(alias: string): void {
    this.confirmationService.confirm({
      message: 'Удалить направление? Все дисциплины и файлы будут удалены.',
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.directionsService.deleteDirection(alias).subscribe({
          next: () =>
            this.messageService.add({ severity: 'success', summary: 'Направление удалено' }),
          error: () => this.messageService.add({ severity: 'error', summary: 'Ошибка удаления' }),
        });
      },
    });
  }

  saveDegreeLevel(): void {
    const name = this.newDegreeLevelName.trim();
    if (!name) return;
    this.directionsService.createDegreeLevel(name).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Уровень добавлен' });
        this.newDegreeLevelName = '';
      },
      error: (err) => {
        const msg = err.error?.error === 'Already exists' ? 'Уже существует' : 'Ошибка';
        this.messageService.add({ severity: 'error', summary: msg });
      },
    });
  }

  deleteDegreeLevel(level: DegreeLevel): void {
    this.confirmationService.confirm({
      message: `Удалить уровень "${level.name}"?`,
      header: 'Подтверждение',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.directionsService.deleteDegreeLevel(level.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Уровень удалён' }),
          error: (err) => {
            const msg =
              err.error?.error === 'Has linked directions'
                ? 'Есть связанные направления'
                : 'Ошибка';
            this.messageService.add({ severity: 'error', summary: msg });
          },
        });
      },
    });
  }

  onDialogHide(): void {
    this.cdr.detectChanges();
  }
}
