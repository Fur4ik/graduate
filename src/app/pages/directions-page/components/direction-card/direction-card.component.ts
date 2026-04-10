import { Component, input, output } from '@angular/core';
import { DirectionEntry } from '../../../../shared/models/direction.models';

@Component({
  selector: 'app-direction-card',
  standalone: true,
  templateUrl: './direction-card.component.html',
  styleUrl: './direction-card.component.scss',
})
export class DirectionCardComponent {
  direction = input.required<DirectionEntry>();
  selected = output<string>();
}
