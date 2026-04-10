import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DirectionEntry } from '../models/direction.models';
import { API } from '../constants/core.constants';

@Injectable({
  providedIn: 'root',
})
export class DirectionsService {
  private http = inject(HttpClient);

  private _directions = signal<DirectionEntry[]>([]);

  readonly directions = this._directions.asReadonly();
  readonly bachelor = computed(() =>
    this._directions().filter((d) => d.degree_level === 'Бакалавриат'),
  );
  readonly master = computed(() =>
    this._directions().filter((d) => d.degree_level === 'Магистратура'),
  );

  load(): Observable<DirectionEntry[]> {
    return this.http
      .get<DirectionEntry[]>(`${API}/directions`)
      .pipe(tap((data) => this._directions.set(data)));
  }

  getEntry(alias: string): DirectionEntry {
    return (
      this._directions().find((d) => d.alias === alias) ?? {
        alias,
        code: '',
        direction: alias,
        profile: '',
        degree_level: '',
      }
    );
  }
}
