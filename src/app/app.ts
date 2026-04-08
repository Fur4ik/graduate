import { Component } from '@angular/core';
import { TeachersComponent } from './teachers/teachers.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TeachersComponent],
  template: `
    <div class="p-6">
      <app-teachers />
    </div>
  `,
})
export class App {}