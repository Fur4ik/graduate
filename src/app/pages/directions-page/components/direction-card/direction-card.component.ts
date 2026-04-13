import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DirectionEntry } from '../../../../shared/models/direction.models';

@Component({
  selector: 'app-direction-card',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './direction-card.component.html',
  styleUrl: './direction-card.component.scss',
})
export class DirectionCardComponent {
  direction = input.required<DirectionEntry>();
  selected = output<number>();
  deleted = output<number>();
  edited = output<DirectionEntry>();

  onDelete(event: Event): void {
    event.stopPropagation();
    this.deleted.emit(this.direction().id);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edited.emit(this.direction());
  }
}
