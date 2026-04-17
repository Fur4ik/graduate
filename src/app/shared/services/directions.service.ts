import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DegreeLevel, DirectionEntry } from '../models/direction.models';
import { API } from '../constants/core.constants';

@Injectable({
  providedIn: 'root',
})
export class DirectionsService {
  private http = inject(HttpClient);

  private _directions = signal<DirectionEntry[]>([]);
  private _degreeLevels = signal<DegreeLevel[]>([]);

  readonly directions = this._directions.asReadonly();
  readonly degreeLevels = this._degreeLevels.asReadonly();

  readonly grouped = computed(() => {
    const map = new Map<string, DirectionEntry[]>();
    for (const level of this._degreeLevels()) {
      map.set(level.name, []);
    }
    for (const d of this._directions()) {
      if (!map.has(d.degree_level)) map.set(d.degree_level, []);
      map.get(d.degree_level)!.push(d);
    }
    return map;
  });

  load(): Observable<DirectionEntry[]> {
    return this.http
      .get<DirectionEntry[]>(`${API}/directions`)
      .pipe(tap((data) => this._directions.set(data)));
  }

  loadDegreeLevels(): Observable<DegreeLevel[]> {
    return this.http
      .get<DegreeLevel[]>(`${API}/degree-levels`)
      .pipe(tap((data) => this._degreeLevels.set(data)));
  }

  createDirection(body: {
    degreeLevelId: number | null;
    code: string;
    name: string;
    profile: string;
  }): Observable<DirectionEntry> {
    return this.http
      .post<DirectionEntry>(`${API}/directions`, body)
      .pipe(tap(() => this.load().subscribe()));
  }

  updateDirection(
    id: number,
    body: { degreeLevelId?: number | null; code?: string; name?: string; profile?: string },
  ): Observable<DirectionEntry> {
    return this.http
      .put<DirectionEntry>(`${API}/directions/${id}`, body)
      .pipe(tap(() => this.load().subscribe()));
  }

  deleteDirection(id: number): Observable<{ deleted: number }> {
    return this.http
      .delete<{ deleted: number }>(`${API}/directions/${id}`)
      .pipe(tap(() => this._directions.update((list) => list.filter((d) => d.id !== id))));
  }

  createDegreeLevel(name: string): Observable<DegreeLevel> {
    return this.http
      .post<DegreeLevel>(`${API}/degree-levels`, { name })
      .pipe(tap((level) => this._degreeLevels.update((list) => [...list, level])));
  }

  deleteDegreeLevel(id: number): Observable<{ deleted: number }> {
    return this.http
      .delete<{ deleted: number }>(`${API}/degree-levels/${id}`)
      .pipe(tap(() => this._degreeLevels.update((list) => list.filter((l) => l.id !== id))));
  }

  getEntry(id: number): DirectionEntry {
    return (
      this._directions().find((d) => d.id === id) ?? {
        id,
        code: '',
        direction: '',
        profile: '',
        degree_level_id: 0,
        degree_level: '',
      }
    );
  }
}
