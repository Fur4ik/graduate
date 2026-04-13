import { Component, input, output } from '@angular/core';
import { DirectionCardComponent } from '../direction-card/direction-card.component';
import { DirectionEntry } from '../../../../shared/models/direction.models';

@Component({
  selector: 'app-direction-card-list',
  standalone: true,
  imports: [DirectionCardComponent],
  templateUrl: './direction-card-list.component.html',
  styleUrl: './direction-card-list.component.scss',
})
export class DirectionCardListComponent {
  directions = input<DirectionEntry[]>([]);
  selected = output<string>();
  deleted = output<string>();
  edited = output<DirectionEntry>();
}
