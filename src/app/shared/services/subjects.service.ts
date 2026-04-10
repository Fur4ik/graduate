import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from '../models/subject.models';
import { API } from '../constants/core.constants';

@Injectable({
  providedIn: 'root',
})
export class SubjectsService {
  private http = inject(HttpClient);

  getAll(alias: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${API}/subjects/${alias}`);
  }

  create(
    alias: string,
    data: { subject: string; teacherId?: number; statusId?: number },
  ): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${API}/subjects/${alias}`, data);
  }

  update(
    alias: string,
    id: number,
    data: Partial<{ subject: string; teacherId: number; statusId: number }>,
  ): Observable<Subject> {
    return this.http.put<Subject>(`${API}/subjects/${alias}/${id}`, data);
  }

  delete(alias: string, id: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(`${API}/subjects/${alias}/${id}`);
  }
}
