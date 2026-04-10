import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subject {
  id: number;
  subject: string;
  statusId: number;
  statusName: string;
  teacherId: number;
  teacherName: string;
  teacherEmail: string | null;
}

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private readonly api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTables(): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/tables`);
  }

  getAll(table: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.api}/subjects/${encodeURIComponent(table)}`);
  }

  create(table: string, data: { subject: string; teacherId?: number; statusId?: number }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(`${this.api}/subjects/${encodeURIComponent(table)}`, data);
  }

  update(table: string, id: number, data: Partial<{ subject: string; teacherId: number; statusId: number }>): Observable<Subject> {
    return this.http.put<Subject>(`${this.api}/subjects/${encodeURIComponent(table)}/${id}`, data);
  }

  delete(table: string, id: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(`${this.api}/subjects/${encodeURIComponent(table)}/${id}`);
  }
}