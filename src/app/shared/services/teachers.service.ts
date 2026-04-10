import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Teacher {
  id: number;
  name: string;
  email: string | null;
}

export interface TeacherSubject {
  table_name: string;
  id: number;
  subject: string;
}

@Injectable({ providedIn: 'root' })
export class TeachersService {
  private http = inject(HttpClient);
  private readonly api = 'http://localhost:3000/api';

  getAll(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.api}/teachers`);
  }

  getSubjects(id: number): Observable<TeacherSubject[]> {
    return this.http.get<TeacherSubject[]>(`${this.api}/teachers/${id}/subjects`);
  }

  create(data: { name: string; email?: string }): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.api}/teachers`, data);
  }

  update(id: number, data: { name?: string; email?: string | null }): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.api}/teachers/${id}`, data);
  }

  delete(id: number): Observable<{ deleted: number }> {
    return this.http.delete<{ deleted: number }>(`${this.api}/teachers/${id}`);
  }
}
